package com.kh.totalproject.github;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.stream.StreamSupport;

import static org.assertj.core.api.Assumptions.assumeThat;
import static org.assertj.core.api.Assertions.assertThat;

/** Spawns the REAL rag/service/github_mcp_server.py (not a mock) and does a real
 * stdio JSON-RPC handshake -- this is the one place the hand-rolled protocol
 * implementation in GithubMcpClient is checked against the actual `mcp` Python SDK's
 * wire format, not just against our own assumptions about it. tools/list makes no
 * GitHub call, so this needs no credentials; a real upload_solution call still
 * isn't exercised here (see docs/github-auto-commit.md "검증의 범위").
 * Skips itself (does not fail the build) if rag/.venv isn't set up -- see
 * GithubMcpProperties. */
class GithubMcpClientTest {
    private static Path ragPython() {
        return Paths.get("..", "rag", ".venv", "bin", "python").toAbsolutePath().normalize();
    }

    private static Path serverScript() {
        return Paths.get("..", "rag", "service", "github_mcp_server.py").toAbsolutePath().normalize();
    }

    @Test
    void realServerAnswersToolsListOverTheRealStdioProtocol() throws Exception {
        assumeThat(Files.isExecutable(ragPython())).as("rag/.venv python available").isTrue();
        assumeThat(Files.exists(serverScript())).as("github_mcp_server.py present").isTrue();

        var client = new GithubMcpClient(new ObjectMapper());
        Map<String, String> scopeEnv = Map.of(
                "GITHUB_INSTALLATION_TOKEN", "test-token-not-sent-to-github-by-this-test",
                "GITHUB_WRITE_OWNER", "octocat", "GITHUB_WRITE_REPO", "hello-world",
                "GITHUB_WRITE_BRANCH", "main", "GITHUB_WRITE_BASE_PATH", "python"
        );

        try (var session = client.start(ragPython().toString(), serverScript(), scopeEnv, Duration.ofSeconds(15))) {
            var tools = session.listTools(Duration.ofSeconds(10));
            List<String> names = StreamSupport.stream(tools.spliterator(), false)
                    .map(n -> n.path("name").asText()).toList();

            assertThat(names).contains("list_repositories", "list_directory", "get_file_content",
                    "list_commits", "get_commit", "upload_solution");
        }
    }
}
