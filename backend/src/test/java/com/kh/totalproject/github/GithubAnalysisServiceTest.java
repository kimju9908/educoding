package com.kh.totalproject.github;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kh.totalproject.exception.CodeReviewException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.transaction.support.TransactionCallback;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/** GithubAnalysisRunner is a mock here -- this is about the claim/dedupe/cancel
 * state machine (section 5 of docs/github-diagnosis.md), not the actual rag-service
 * call. See GithubAnalysisRunnerTest for the run itself. */
class GithubAnalysisServiceTest {
    GithubConnectionService connectionService = mock(GithubConnectionService.class);
    GithubAnalysisRunner runner = mock(GithubAnalysisRunner.class);
    GithubCatalogLinker catalogLinker = mock(GithubCatalogLinker.class);
    GithubAnalysisRepository analyses = mock(GithubAnalysisRepository.class);
    GithubUserLock userLock = mock(GithubUserLock.class);
    TransactionTemplate tx = mock(TransactionTemplate.class);
    ObjectMapper mapper = new ObjectMapper();
    GithubAnalysisService service;
    List<GithubAnalysisEntity> saved = new ArrayList<>();

    @BeforeEach
    @SuppressWarnings("unchecked")
    void setup() {
        service = new GithubAnalysisService(connectionService, runner, catalogLinker, analyses, userLock, tx, mapper);
        when(tx.execute(any())).thenAnswer(i -> ((TransactionCallback<?>) i.getArgument(0)).doInTransaction(null));
        doAnswer(i -> { ((Consumer<Object>) i.getArgument(0)).accept(null); return null; })
                .when(tx).executeWithoutResult(any());

        when(analyses.findFirstByUserKeyOrderByIdDesc(anyLong())).thenAnswer(i -> saved.stream()
                .filter(a -> a.getUserKey().equals(i.getArgument(0)))
                .max(java.util.Comparator.comparing(GithubAnalysisEntity::getId)));
        when(analyses.findById(anyLong())).thenAnswer(i -> saved.stream()
                .filter(a -> a.getId().equals(i.getArgument(0))).findFirst());
        when(analyses.saveAndFlush(any())).thenAnswer(this::persist);
        when(analyses.save(any())).thenAnswer(this::persist);

        var connection = new GithubConnectionEntity();
        connection.setId(10L);
        connection.setUserKey(1L);
        connection.setInstallationId(555L);
        when(connectionService.requireInstalled(1L)).thenReturn(connection);
        var repo = new GithubRepositoryEntity();
        repo.setId(1L); repo.setConnectionId(10L); repo.setOwner("octocat"); repo.setName("hello-world"); repo.setSelected(true);
        when(connectionService.selectedRepositories(10L)).thenReturn(List.of(repo));
    }

    private GithubAnalysisEntity persist(org.mockito.invocation.InvocationOnMock i) {
        GithubAnalysisEntity row = i.getArgument(0);
        if (row.getId() == null) { row.setId((long) saved.size() + 1); saved.add(row); }
        return row;
    }

    @Test
    void requestWithNoSelectedRepositoriesIsRejected() {
        when(connectionService.selectedRepositories(10L)).thenReturn(List.of());

        assertThatThrownBy(() -> service.requestAnalysis(1L)).isInstanceOf(CodeReviewException.class);
        verifyNoInteractions(runner);
    }

    @Test
    void requestClaimsPendingAndTriggersTheRunnerExactlyOnce() {
        var view = service.requestAnalysis(1L);

        assertThat(view.status()).isEqualTo("PENDING");
        assertThat(view.generating()).isTrue();
        verify(runner, times(1)).run(eq(saved.get(0).getId()), eq(10L), eq(1L));
    }

    @Test
    void secondRequestWhileOneIsStillActiveDedupesWithoutStartingAnother() {
        var first = service.requestAnalysis(1L);

        var second = service.requestAnalysis(1L);

        assertThat(second.id()).isEqualTo(first.id());
        verify(runner, times(1)).run(any(), any(), any());
    }

    @Test
    void aStaleActiveRequestCanBeReclaimedAfter180Seconds() {
        var first = service.requestAnalysis(1L);
        saved.get(0).setRequestedAt(LocalDateTime.now().minusSeconds(200));

        var second = service.requestAnalysis(1L);

        assertThat(second.id()).isNotEqualTo(first.id());
        verify(runner, times(2)).run(any(), any(), any());
    }

    @Test
    void cancellingAPendingRequestCancelsItImmediately() {
        var view = service.requestAnalysis(1L);

        var cancelled = service.cancel(1L, view.id());

        assertThat(cancelled.status()).isEqualTo("CANCELLED");
    }

    @Test
    void cancellingARunningRequestOnlyRequestsCancellationForTheRunnerToHonor() {
        var view = service.requestAnalysis(1L);
        saved.get(0).setStatus("RUNNING");

        var result = service.cancel(1L, view.id());

        assertThat(result.status()).isEqualTo("RUNNING"); // not cancelled yet -- best-effort, see the runner
        assertThat(saved.get(0).isCancelRequested()).isTrue();
    }

    @Test
    void anotherUserCannotReadOrCancelSomeoneElsesAnalysis() {
        var view = service.requestAnalysis(1L);

        assertThatThrownBy(() -> service.get(2L, view.id())).isInstanceOf(CodeReviewException.class);
        assertThatThrownBy(() -> service.cancel(2L, view.id())).isInstanceOf(CodeReviewException.class);
    }

    @Test
    void latestWithNoPriorRequestsReportsNoneWithoutTouchingTheRunner() {
        var view = service.latest(1L);

        assertThat(view.status()).isEqualTo("NONE");
        verifyNoInteractions(runner);
    }
}
