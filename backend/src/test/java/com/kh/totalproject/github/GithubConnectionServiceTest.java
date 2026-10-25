package com.kh.totalproject.github;

import com.kh.totalproject.exception.CodeReviewException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.transaction.support.TransactionCallback;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.function.Consumer;

import static com.kh.totalproject.github.GithubModels.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/** GithubAppClient and GithubStateToken are doubles -- this verifies the identity/
 * ownership checks docs/github-diagnosis.md section 1 exists for (forged state,
 * installing-under-someone-else's-account, claiming an installation that isn't
 * the caller's own), not a live GitHub OAuth round-trip. */
class GithubConnectionServiceTest {
    GithubAppProperties properties = mock(GithubAppProperties.class);
    GithubAppClient client = mock(GithubAppClient.class);
    GithubStateToken stateToken = mock(GithubStateToken.class);
    GithubConnectionRepository connections = mock(GithubConnectionRepository.class);
    GithubRepositoryRepository repositories = mock(GithubRepositoryRepository.class);
    GithubUserLock userLock = mock(GithubUserLock.class);
    TransactionTemplate tx = mock(TransactionTemplate.class);
    GithubConnectionService service;
    List<GithubConnectionEntity> savedConnections = new ArrayList<>();
    List<GithubRepositoryEntity> savedRepos = new ArrayList<>();

    @BeforeEach
    @SuppressWarnings("unchecked")
    void setup() {
        service = new GithubConnectionService(properties, client, stateToken, connections, repositories, userLock, tx);
        when(properties.configured()).thenReturn(true);
        when(properties.domainUrl()).thenReturn("https://educoding.test");
        when(properties.appSlug()).thenReturn("educoding-app");
        when(properties.clientId()).thenReturn("client-id");

        when(tx.execute(any())).thenAnswer(i -> ((TransactionCallback<?>) i.getArgument(0)).doInTransaction(null));
        doAnswer(i -> { ((Consumer<Object>) i.getArgument(0)).accept(null); return null; })
                .when(tx).executeWithoutResult(any());

        when(connections.findByUserKey(anyLong())).thenAnswer(i -> savedConnections.stream()
                .filter(c -> c.getUserKey().equals(i.getArgument(0))).findFirst());
        when(connections.save(any())).thenAnswer(i -> {
            GithubConnectionEntity c = i.getArgument(0);
            if (c.getId() == null) { c.setId((long) savedConnections.size() + 1); savedConnections.add(c); }
            return c;
        });
        when(repositories.findByConnectionId(anyLong())).thenAnswer(i -> savedRepos.stream()
                .filter(r -> r.getConnectionId().equals(i.getArgument(0))).toList());
        when(repositories.findByConnectionIdAndSelectedTrue(anyLong())).thenAnswer(i -> savedRepos.stream()
                .filter(r -> r.getConnectionId().equals(i.getArgument(0)) && r.isSelected()).toList());
        doAnswer(i -> { savedRepos.removeIf(r -> r.getConnectionId().equals(i.getArgument(0))); return null; })
                .when(repositories).deleteByConnectionId(anyLong());
        when(repositories.save(any())).thenAnswer(i -> {
            GithubRepositoryEntity r = i.getArgument(0);
            if (r.getId() == null) { r.setId((long) savedRepos.size() + 1); savedRepos.add(r); }
            return r;
        });
    }

    private GithubConnectionEntity loggedInConnection(Long userKey, long githubUserId) {
        var c = new GithubConnectionEntity();
        c.setId((long) savedConnections.size() + 1);
        c.setUserKey(userKey);
        c.setGithubUserId(githubUserId);
        c.setGithubLogin("octocat");
        savedConnections.add(c);
        return c;
    }

    // ---- OAuth callback (step 1: identity) -----------------------------------------

    @Test
    void oauthCallbackWithForgedOrExpiredStateNeverSavesAConnection() {
        when(stateToken.verify("bad-state", GithubStateToken.PURPOSE_OAUTH)).thenReturn(null);

        String redirect = service.handleOAuthCallback("code", "bad-state");

        assertThat(redirect).contains("githubStatus=github_oauth_invalid_state");
        verifyNoInteractions(client);
        assertThat(savedConnections).isEmpty();
    }

    @Test
    void oauthCallbackWithValidStateSavesIdentityOnlyNotInstallation() {
        when(stateToken.verify("state", GithubStateToken.PURPOSE_OAUTH)).thenReturn(1L);
        when(client.resolveIdentity("code")).thenReturn(new GithubAppClient.GithubIdentity(42L, "octocat"));

        String redirect = service.handleOAuthCallback("code", "state");

        assertThat(redirect).contains("githubStatus=connected");
        var saved = savedConnections.get(0);
        assertThat(saved.getGithubUserId()).isEqualTo(42L);
        assertThat(saved.isLoggedIn()).isTrue();
        assertThat(saved.isInstalled()).isFalse();
    }

    // ---- install callback (step 2: repo access) ------------------------------------

    @Test
    void installStartRequiresLoginFirst() {
        assertThatThrownBy(() -> service.startInstall(99L)).isInstanceOf(CodeReviewException.class);
    }

    @Test
    void installCallbackWithoutOauthCodeIsRejectedEvenWithValidState() {
        when(stateToken.verify("state", GithubStateToken.PURPOSE_INSTALL)).thenReturn(1L);

        String redirect = service.handleInstallCallback(555L, "install", null, "state");

        assertThat(redirect).contains("github_install_unverifiable");
        verifyNoInteractions(client);
    }

    @Test
    void installCallbackRejectsWhenInstallerIsADifferentGithubAccountThanTheLoggedInOne() {
        loggedInConnection(1L, 42L); // logged in as github user 42
        when(stateToken.verify("state", GithubStateToken.PURPOSE_INSTALL)).thenReturn(1L);
        when(client.exchangeCodeForUserToken("code")).thenReturn("user-token");
        when(client.getUser("user-token")).thenReturn(new GithubAppClient.GithubIdentity(999L, "someone-else"));

        String redirect = service.handleInstallCallback(555L, "install", "code", "state");

        assertThat(redirect).contains("github_install_account_mismatch");
        verify(client, never()).createInstallationToken(anyLong());
        assertThat(savedConnections.get(0).isInstalled()).isFalse();
    }

    @Test
    void installCallbackRejectsAnInstallationTheCallerDoesNotOwn() {
        loggedInConnection(1L, 42L);
        when(stateToken.verify("state", GithubStateToken.PURPOSE_INSTALL)).thenReturn(1L);
        when(client.exchangeCodeForUserToken("code")).thenReturn("user-token");
        when(client.getUser("user-token")).thenReturn(new GithubAppClient.GithubIdentity(42L, "octocat"));
        when(client.listUserInstallationIds("user-token")).thenReturn(List.of(111L, 222L)); // not 555

        String redirect = service.handleInstallCallback(555L, "install", "code", "state");

        assertThat(redirect).contains("github_install_not_owned");
        verify(client, never()).createInstallationToken(anyLong());
    }

    @Test
    void installCallbackExchangesTheOauthCodeExactlyOnce() {
        loggedInConnection(1L, 42L);
        when(stateToken.verify("state", GithubStateToken.PURPOSE_INSTALL)).thenReturn(1L);
        when(client.exchangeCodeForUserToken("code")).thenReturn("user-token");
        when(client.getUser("user-token")).thenReturn(new GithubAppClient.GithubIdentity(42L, "octocat"));
        when(client.listUserInstallationIds("user-token")).thenReturn(List.of(555L));
        when(client.getInstallation(555L)).thenReturn(new GithubAppClient.InstallationInfo("octocat", "User", false));
        when(client.createInstallationToken(555L)).thenReturn("install-token");
        when(client.listInstallationRepositories("install-token")).thenReturn(List.of(
                new GithubAppClient.RepoRef(1001L, "octocat", "hello-world", "main")));

        String redirect = service.handleInstallCallback(555L, "install", "code", "state");

        assertThat(redirect).contains("githubStatus=installed");
        verify(client, times(1)).exchangeCodeForUserToken("code");
        assertThat(savedConnections.get(0).isInstalled()).isTrue();
        assertThat(savedConnections.get(0).getInstallationId()).isEqualTo(555L);
        assertThat(savedRepos).hasSize(1);
        assertThat(savedRepos.get(0).isSelected()).isFalse(); // newly installed repos start unselected
    }

    @Test
    void reinstallPreservesPreviousSelectionUpToTheCap() {
        var connection = loggedInConnection(1L, 42L);
        connection.setInstallationId(555L);
        var kept = new GithubRepositoryEntity();
        kept.setId(1L); kept.setConnectionId(connection.getId()); kept.setGithubRepoId(1001L);
        kept.setOwner("octocat"); kept.setName("hello-world"); kept.setSelected(true);
        savedRepos.add(kept);

        when(stateToken.verify("state", GithubStateToken.PURPOSE_INSTALL)).thenReturn(1L);
        when(client.exchangeCodeForUserToken("code")).thenReturn("user-token");
        when(client.getUser("user-token")).thenReturn(new GithubAppClient.GithubIdentity(42L, "octocat"));
        when(client.listUserInstallationIds("user-token")).thenReturn(List.of(555L));
        when(client.getInstallation(555L)).thenReturn(new GithubAppClient.InstallationInfo("octocat", "User", false));
        when(client.createInstallationToken(555L)).thenReturn("install-token");
        when(client.listInstallationRepositories("install-token")).thenReturn(List.of(
                new GithubAppClient.RepoRef(1001L, "octocat", "hello-world", "main"),
                new GithubAppClient.RepoRef(1002L, "octocat", "new-repo", "main")));

        service.handleInstallCallback(555L, "install", "code", "state");

        var byRepoId = savedRepos.stream().collect(java.util.stream.Collectors.toMap(GithubRepositoryEntity::getGithubRepoId, r -> r));
        assertThat(byRepoId.get(1001L).isSelected()).isTrue();
        assertThat(byRepoId.get(1002L).isSelected()).isFalse();
    }

    // ---- repository selection -------------------------------------------------------

    @Test
    void selectingMoreThanThreeRepositoriesIsRejected() {
        var connection = loggedInConnection(1L, 42L);
        connection.setInstallationId(555L);

        assertThatThrownBy(() -> service.selectRepositories(1L, List.of(1L, 2L, 3L, 4L)))
                .isInstanceOf(CodeReviewException.class);
    }

    @Test
    void selectingARepositoryOutsideTheInstalledListIsRejected() {
        var connection = loggedInConnection(1L, 42L);
        connection.setInstallationId(555L);
        var r = new GithubRepositoryEntity();
        r.setId(1L); r.setConnectionId(connection.getId()); r.setOwner("o"); r.setName("r");
        savedRepos.add(r);

        assertThatThrownBy(() -> service.selectRepositories(1L, List.of(999L)))
                .isInstanceOf(CodeReviewException.class);
    }

    @Test
    void selectingValidRepositoriesMarksExactlyThoseSelected() {
        var connection = loggedInConnection(1L, 42L);
        connection.setInstallationId(555L);
        for (long id = 1; id <= 2; id++) {
            var r = new GithubRepositoryEntity();
            r.setId(id); r.setConnectionId(connection.getId()); r.setGithubRepoId(1000L + id); r.setOwner("o"); r.setName("r" + id);
            savedRepos.add(r);
        }

        var view = service.selectRepositories(1L, List.of(1L));

        assertThat(view.repositories()).filteredOn(RepoView::selected).extracting(RepoView::id).containsExactly(1L);
    }

    // ---- disconnect -------------------------------------------------------------------

    @Test
    void disconnectHidesTheConnectionFromFutureViews() {
        loggedInConnection(1L, 42L);

        service.disconnect(1L);

        assertThat(service.connectionView(1L).loggedIn()).isFalse();
    }
}
