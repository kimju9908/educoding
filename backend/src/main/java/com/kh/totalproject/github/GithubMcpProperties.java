package com.kh.totalproject.github;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/** Where to find the local rag/service MCP server subprocess (github_mcp_server.py)
 * and the Python interpreter that has its deps (mcp, requests) installed -- i.e.
 * rag/.venv's python, not whatever "python3" happens to be on PATH. See
 * docs/github-auto-commit.md section 2: AutoCommitJobRunner spawns this directly,
 * no model in the loop. */
@Component
public class GithubMcpProperties {
    @Value("${github.mcp.python-executable:}") private String pythonExecutable;
    @Value("${github.mcp.server-script:}") private String serverScript;

    public String pythonExecutable() { return pythonExecutable; }
    public String serverScript() { return serverScript; }

    public boolean configured() {
        return !blank(pythonExecutable) && !blank(serverScript);
    }
    private boolean blank(String s) { return s == null || s.isBlank(); }
}
