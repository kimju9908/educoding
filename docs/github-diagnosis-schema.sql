-- New tables only. Apply using the deployment's migration process when ddl-auto is disabled.
-- See docs/github-diagnosis.md for what each column is for.

CREATE TABLE IF NOT EXISTS github_connection (
  connection_id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_key BIGINT NOT NULL,
  github_user_id BIGINT NULL,
  github_login VARCHAR(100) NULL,
  installation_id BIGINT NULL,
  installation_account_login VARCHAR(100) NULL,
  installation_account_type VARCHAR(20) NULL,
  connected_at DATETIME(6) NULL,
  installed_at DATETIME(6) NULL,
  revoked_at DATETIME(6) NULL,
  UNIQUE KEY uq_github_connection_user (user_key),
  INDEX idx_github_connection_owner (user_key)
);

CREATE TABLE IF NOT EXISTS github_repository (
  repository_id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  connection_id BIGINT NOT NULL,
  github_repo_id BIGINT NOT NULL,
  owner VARCHAR(100) NOT NULL,
  name VARCHAR(100) NOT NULL,
  default_branch VARCHAR(100) NULL,
  selected TINYINT(1) NOT NULL DEFAULT 0,
  selected_at DATETIME(6) NULL,
  INDEX idx_github_repository_connection (connection_id)
);

CREATE TABLE IF NOT EXISTS github_analysis (
  analysis_id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_key BIGINT NOT NULL,
  connection_id BIGINT NOT NULL,
  status VARCHAR(20) NOT NULL, -- PENDING / RUNNING / COMPLETED / FAILED / CANCELLED
  requested_at DATETIME(6) NOT NULL,
  started_at DATETIME(6) NULL,
  completed_at DATETIME(6) NULL,
  repos_json LONGTEXT NOT NULL,
  result_json LONGTEXT NULL,
  error_message VARCHAR(500) NULL,
  cancel_requested TINYINT(1) NOT NULL DEFAULT 0,
  INDEX idx_github_analysis_owner (user_key, analysis_id)
);
