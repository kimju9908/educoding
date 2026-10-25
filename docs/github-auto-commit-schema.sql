-- New tables only. Apply using the deployment's migration process when ddl-auto is disabled.
-- See docs/github-auto-commit.md for what each column is for.
-- Also adds two columns to the existing github_connection table (docs/github-diagnosis-schema.sql) --
-- apply that schema first.

ALTER TABLE github_connection
  ADD COLUMN write_permission_granted TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN write_permission_checked_at DATETIME(6) NULL;

CREATE TABLE IF NOT EXISTS github_auto_save_setting (
  setting_id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_key BIGINT NOT NULL,
  connection_id BIGINT NOT NULL,
  repository_id BIGINT NOT NULL,
  owner VARCHAR(100) NOT NULL,
  name VARCHAR(100) NOT NULL,
  branch VARCHAR(100) NOT NULL,
  base_path VARCHAR(200) NOT NULL DEFAULT '',
  enabled TINYINT(1) NOT NULL DEFAULT 0,
  enabled_at DATETIME(6) NULL,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL,
  UNIQUE KEY uq_auto_save_setting_user (user_key),
  INDEX idx_auto_save_setting_owner (user_key)
);

CREATE TABLE IF NOT EXISTS github_auto_commit_job (
  job_id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_key BIGINT NOT NULL,
  judgment_id BIGINT NOT NULL,
  challenge_id BIGINT NOT NULL,
  status VARCHAR(20) NOT NULL, -- PENDING / RUNNING / COMPLETED / FAILED / SKIPPED
  error_category VARCHAR(20) NULL, -- TRANSIENT / PERMISSION / CONFLICT / UNKNOWN
  error_message VARCHAR(500) NULL,
  owner VARCHAR(100) NOT NULL,
  name VARCHAR(100) NOT NULL,
  branch VARCHAR(100) NOT NULL,
  path VARCHAR(300) NOT NULL,
  summary_json LONGTEXT NULL,
  summary_version INT NULL,
  attempt_count INT NOT NULL DEFAULT 0,
  next_attempt_at DATETIME(6) NULL,
  commit_sha VARCHAR(64) NULL,
  commit_url VARCHAR(300) NULL,
  solution_blob_sha VARCHAR(64) NULL,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL,
  version BIGINT NULL,
  UNIQUE KEY uk_auto_commit_job_judgment (judgment_id),
  INDEX idx_auto_commit_job_owner (user_key, job_id)
);
