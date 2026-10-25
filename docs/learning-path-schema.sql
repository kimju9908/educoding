-- New table only. Apply using the deployment's migration process when ddl-auto is disabled.
CREATE TABLE IF NOT EXISTS learning_plan (
  plan_id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_key BIGINT NOT NULL,
  profile_key VARCHAR(80) NOT NULL,
  fingerprint VARCHAR(64) NOT NULL,
  rules_version INT NOT NULL,
  as_of DATETIME(6) NOT NULL,
  started_at DATETIME(6) NOT NULL,
  generated_at DATETIME(6) NULL,
  snapshot_json LONGTEXT NOT NULL,
  steps_json LONGTEXT NULL,
  source VARCHAR(20) NOT NULL,
  INDEX idx_learning_plan_owner (user_key, profile_key, plan_id)
);
