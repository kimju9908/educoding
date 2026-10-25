package com.kh.totalproject.github;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

/** A small, hand-rolled MCP client over stdio (JSON-RPC 2.0, newline-delimited) --
 * see docs/github-auto-commit.md section 2 for why this talks to
 * rag/service/github_mcp_server.py directly instead of going through Python/
 * LangGraph: no model is involved in this call at all, so there is nothing for an
 * agent loop to do here. No MCP SDK dependency was added for this -- the protocol
 * surface this needs (initialize handshake + tools/call) is small and verified
 * directly against the real server process in GithubMcpClientTest, not just mocked. */
@Component
public class GithubMcpClient {
    private final ObjectMapper mapper;

    public GithubMcpClient(ObjectMapper mapper) {
        this.mapper = mapper;
    }

    public Session start(String pythonExecutable, Path serverScript, Map<String, String> scopeEnv, Duration timeout) throws IOException {
        var pb = new ProcessBuilder(pythonExecutable, serverScript.toString());
        pb.environment().putAll(scopeEnv); // overlaid on the inherited environment (PATH etc. stay intact)
        pb.directory(serverScript.getParent().toFile());
        pb.redirectErrorStream(false);
        Process process = pb.start();
        try {
            return new Session(process, mapper, timeout);
        } catch (IOException | RuntimeException e) {
            process.destroyForcibly();
            throw e;
        }
    }

    public static final class McpToolError extends IOException {
        public McpToolError(String message) { super(message); }
    }

    public static final class Session implements AutoCloseable {
        private final Process process;
        private final ObjectMapper mapper;
        private final BufferedReader reader;
        private final BufferedWriter writer;
        private final ExecutorService ioExecutor = Executors.newSingleThreadExecutor();
        private int nextId = 1;

        private Session(Process process, ObjectMapper mapper, Duration timeout) throws IOException {
            this.process = process;
            this.mapper = mapper;
            this.reader = new BufferedReader(new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8));
            this.writer = new BufferedWriter(new OutputStreamWriter(process.getOutputStream(), StandardCharsets.UTF_8));
            initialize(timeout);
        }

        private void initialize(Duration timeout) throws IOException {
            int id = nextId++;
            send("initialize", Map.of(
                    "protocolVersion", "2024-11-05",
                    "capabilities", Map.of(),
                    "clientInfo", Map.of("name", "educoding-backend", "version", "1.0")
            ), id);
            JsonNode response = readResponse(id, timeout);
            if (response.has("error")) {
                throw new IOException("MCP initialize failed: " + response.path("error").toString());
            }
            sendNotification("notifications/initialized", Map.of());
        }

        /** @return the raw JSON text each MCP tool returns (this server's tools all
         * return a single text content block -- see github_mcp_server.py). Throws
         * McpToolError with the tool's own error text (including any "[CATEGORY]"
         * prefix -- AutoCommitJobRunner classifies on that) if isError is true. */
        public String callTool(String name, Map<String, Object> arguments, Duration timeout) throws IOException {
            int id = nextId++;
            send("tools/call", Map.of("name", name, "arguments", arguments), id);
            JsonNode response = readResponse(id, timeout);
            if (response.has("error")) {
                JsonNode messageNode = response.path("error").path("message");
                throw new McpToolError(messageNode.isTextual() ? messageNode.asText() : response.path("error").toString());
            }
            JsonNode result = response.path("result");
            String text = joinText(result.path("content"));
            if (result.path("isError").asBoolean(false)) {
                throw new McpToolError(text);
            }
            return text;
        }

        public JsonNode listTools(Duration timeout) throws IOException {
            int id = nextId++;
            send("tools/list", Map.of(), id);
            JsonNode response = readResponse(id, timeout);
            if (response.has("error")) {
                throw new IOException("MCP tools/list failed: " + response.path("error"));
            }
            return response.path("result").path("tools");
        }

        private String joinText(JsonNode contentArray) {
            StringBuilder sb = new StringBuilder();
            if (contentArray.isArray()) {
                for (JsonNode block : contentArray) {
                    sb.append(block.path("text").asText());
                }
            }
            return sb.toString();
        }

        private void send(String method, Object params, Integer id) throws IOException {
            var message = new LinkedHashMap<String, Object>();
            message.put("jsonrpc", "2.0");
            if (id != null) message.put("id", id);
            message.put("method", method);
            message.put("params", params);
            writer.write(mapper.writeValueAsString(message));
            writer.write("\n");
            writer.flush();
        }

        private void sendNotification(String method, Object params) throws IOException {
            send(method, params, null);
        }

        private JsonNode readResponse(int expectedId, Duration timeout) throws IOException {
            var future = ioExecutor.submit(() -> {
                String line;
                while ((line = reader.readLine()) != null) {
                    JsonNode node;
                    try {
                        node = mapper.readTree(line);
                    } catch (Exception malformed) {
                        continue; // defensive: ignore any stray non-JSON-RPC output on stdout
                    }
                    if (node.has("id") && node.path("id").asInt(-1) == expectedId) {
                        return node;
                    }
                }
                throw new IOException("MCP server closed its output before responding (exit code "
                        + (process.isAlive() ? "still running" : process.exitValue()) + ")");
            });
            try {
                return future.get(timeout.toMillis(), TimeUnit.MILLISECONDS);
            } catch (TimeoutException e) {
                process.destroyForcibly();
                throw new IOException("MCP call timed out after " + timeout, e);
            } catch (Exception e) {
                throw new IOException("MCP call failed: " + e.getMessage(), e);
            }
        }

        @Override
        public void close() {
            ioExecutor.shutdownNow();
            try {
                writer.close();
            } catch (IOException ignored) {
                // best-effort -- the process is being killed next regardless
            }
            process.destroyForcibly();
        }
    }
}
