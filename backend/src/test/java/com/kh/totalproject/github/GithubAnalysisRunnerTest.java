package com.kh.totalproject.github;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.transaction.support.TransactionCallback;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.List;
import java.util.Set;
import java.util.function.Consumer;

import static com.kh.totalproject.github.GithubModels.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/** The actual background run -- called directly (not through @Async) so these are
 * plain synchronous unit tests. Covers what only exists at this layer: pinning the
 * HEAD SHA right before the call, re-validating recommendedTopics against the
 * allowed-concept list a second time (github_graph.py already validated it once),
 * best-effort cancellation checkpoints, and never leaking an exception's own
 * message into the stored error. */
class GithubAnalysisRunnerTest {
    GithubConnectionService connectionService = mock(GithubConnectionService.class);
    GithubAppClient appClient = mock(GithubAppClient.class);
    GithubAnalysisClient analysisClient = mock(GithubAnalysisClient.class);
    GithubCatalogLinker catalogLinker = mock(GithubCatalogLinker.class);
    GithubAnalysisRepository analyses = mock(GithubAnalysisRepository.class);
    TransactionTemplate tx = mock(TransactionTemplate.class);
    ObjectMapper mapper = new ObjectMapper();
    GithubAnalysisRunner runner;
    GithubAnalysisEntity row;

    @BeforeEach
    @SuppressWarnings("unchecked")
    void setup() {
        runner = new GithubAnalysisRunner(connectionService, appClient, analysisClient, catalogLinker, analyses, tx, mapper);
        when(tx.execute(any())).thenAnswer(i -> ((TransactionCallback<?>) i.getArgument(0)).doInTransaction(null));
        doAnswer(i -> { ((Consumer<Object>) i.getArgument(0)).accept(null); return null; })
                .when(tx).executeWithoutResult(any());

        row = new GithubAnalysisEntity();
        row.setId(1L); row.setUserKey(1L); row.setConnectionId(10L); row.setStatus("PENDING");
        when(analyses.findById(1L)).thenReturn(java.util.Optional.of(row));
        when(analyses.save(any())).thenReturn(row);

        var connection = new GithubConnectionEntity();
        connection.setId(10L); connection.setInstallationId(555L); connection.setGithubLogin("octocat");
        when(connectionService.requireInstalled(1L)).thenReturn(connection);
        var repo = new GithubRepositoryEntity();
        repo.setOwner("octocat"); repo.setName("hello-world"); repo.setDefaultBranch("main"); repo.setSelected(true);
        when(connectionService.selectedRepositories(10L)).thenReturn(List.of(repo));
        when(appClient.createInstallationToken(555L)).thenReturn("install-token");
        when(appClient.getDefaultBranchHeadSha("install-token", "octocat", "hello-world", "main")).thenReturn("a".repeat(40));
        when(catalogLinker.allowedConcepts()).thenReturn(Set.of("반복문"));
    }

    private DiagnoseResponse response(List<RawRecommendedTopic> topics) {
        return new DiagnoseResponse(List.of(), List.of(), topics, "scope", new ActualScope(List.of(), 1, 1, 0, false));
    }

    @Test
    void successfulRunPinsHeadShaAndFiltersTopicsOutsideTheAllowedConceptList() {
        when(analysisClient.diagnose(any(), eq("install-token"))).thenReturn(response(List.of(
                new RawRecommendedTopic("반복문", "ok"), new RawRecommendedTopic("양자컴퓨팅", "model made this up"))));

        runner.run(1L, 10L, 1L);

        assertThat(row.getStatus()).isEqualTo("COMPLETED");
        assertThat(row.getReposJson()).contains("a".repeat(40)); // pinned HEAD sha, not the model's own claim
        assertThat(row.getResultJson()).contains("반복문").doesNotContain("양자컴퓨팅");
        var sentRequest = org.mockito.ArgumentCaptor.forClass(DiagnoseRequest.class);
        verify(analysisClient).diagnose(sentRequest.capture(), eq("install-token"));
        assertThat(sentRequest.getValue().allowedRepos().get(0).headSha()).isEqualTo("a".repeat(40));
    }

    @Test
    void cancellationRequestedBeforeTheRunStartsSkipsTheAnalysisClientEntirely() {
        row.setCancelRequested(true);

        runner.run(1L, 10L, 1L);

        assertThat(row.getStatus()).isEqualTo("CANCELLED");
        verifyNoInteractions(analysisClient);
    }

    @Test
    void cancellationRequestedWhileTheCallWasInFlightEndsCancelledNotCompleted() {
        when(analysisClient.diagnose(any(), any())).thenAnswer(i -> {
            row.setCancelRequested(true); // simulates the user clicking cancel mid-call
            return response(List.of());
        });

        runner.run(1L, 10L, 1L);

        assertThat(row.getStatus()).isEqualTo("CANCELLED");
        assertThat(row.getResultJson()).isNull(); // the result that arrived after cancellation is discarded
    }

    @Test
    void anExceptionDuringTheRunNeverLeaksItsOwnMessageIntoTheStoredError() {
        when(analysisClient.diagnose(any(), any())).thenThrow(new RuntimeException("sk-super-secret-leak"));

        runner.run(1L, 10L, 1L);

        assertThat(row.getStatus()).isEqualTo("FAILED");
        assertThat(row.getErrorMessage()).doesNotContain("sk-super-secret-leak").contains("RuntimeException");
    }
}
