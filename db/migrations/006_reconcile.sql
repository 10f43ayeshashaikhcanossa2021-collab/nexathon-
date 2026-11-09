-- Migration 006: Schema Reconciliation (Phase 2)
-- Adds org_id to child tables, auth_sessions, row_version optimistic locking,
-- account security columns, unique constraints, and immutability triggers.

-- 1. Account security columns on users
ALTER TABLE users ADD COLUMN IF NOT EXISTS token_version int NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until timestamptz;
ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password boolean NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at timestamptz;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_changed_at timestamptz;

-- 2. Add org_id to child tables missing direct tenant scoping
-- brand_guidelines
ALTER TABLE brand_guidelines ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES organisations(org_id) ON DELETE CASCADE;
UPDATE brand_guidelines bg
SET org_id = bp.org_id
FROM brand_profiles bp
WHERE bg.profile_id = bp.profile_id AND bg.org_id IS NULL;

-- approved_facts
ALTER TABLE approved_facts ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES organisations(org_id) ON DELETE CASCADE;
UPDATE approved_facts af
SET org_id = bp.org_id
FROM brand_profiles bp
WHERE af.profile_id = bp.profile_id AND af.org_id IS NULL;

-- terminology
ALTER TABLE terminology ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES organisations(org_id) ON DELETE CASCADE;
UPDATE terminology t
SET org_id = bp.org_id
FROM brand_profiles bp
WHERE t.profile_id = bp.profile_id AND t.org_id IS NULL;

-- brand_assets
ALTER TABLE brand_assets ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES organisations(org_id) ON DELETE CASCADE;
UPDATE brand_assets ba
SET org_id = bp.org_id
FROM brand_profiles bp
WHERE ba.profile_id = bp.profile_id AND ba.org_id IS NULL;

-- content_versions
ALTER TABLE content_versions ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES organisations(org_id) ON DELETE CASCADE;
UPDATE content_versions cv
SET org_id = cs.org_id
FROM content_submissions cs
WHERE cv.submission_id = cs.submission_id AND cv.org_id IS NULL;

-- analysis_reports
ALTER TABLE analysis_reports ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES organisations(org_id) ON DELETE CASCADE;
UPDATE analysis_reports ar
SET org_id = cv.org_id
FROM content_versions cv
WHERE ar.version_id = cv.version_id AND ar.org_id IS NULL;

-- detected_issues
ALTER TABLE detected_issues ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES organisations(org_id) ON DELETE CASCADE;
UPDATE detected_issues di
SET org_id = ar.org_id
FROM analysis_reports ar
WHERE di.report_id = ar.report_id AND di.org_id IS NULL;

-- review_comments
ALTER TABLE review_comments ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES organisations(org_id) ON DELETE CASCADE;
UPDATE review_comments rc
SET org_id = cv.org_id
FROM content_versions cv
WHERE rc.version_id = cv.version_id AND rc.org_id IS NULL;

-- approval_records
ALTER TABLE approval_records ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES organisations(org_id) ON DELETE CASCADE;
UPDATE approval_records apr
SET org_id = cv.org_id
FROM content_versions cv
WHERE apr.version_id = cv.version_id AND apr.org_id IS NULL;

-- 3. Create correction_suggestions table if not exists
CREATE TABLE IF NOT EXISTS correction_suggestions (
  suggestion_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id uuid NOT NULL REFERENCES detected_issues(issue_id) ON DELETE CASCADE,
  org_id uuid NOT NULL REFERENCES organisations(org_id) ON DELETE CASCADE,
  original_text text NOT NULL,
  suggested_text text NOT NULL,
  reasoning text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'modified')),
  decided_by uuid REFERENCES users(user_id),
  decided_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Session Table for refresh token rotation & reuse detection
CREATE TABLE IF NOT EXISTS auth_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  org_id uuid NOT NULL REFERENCES organisations(org_id) ON DELETE CASCADE,
  refresh_token_hash text NOT NULL,
  user_agent text,
  ip_address text,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_auth_sessions_user ON auth_sessions(user_id, revoked_at);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_token ON auth_sessions(refresh_token_hash);

-- 5. Concurrency control: row_version columns & triggers
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS row_version int NOT NULL DEFAULT 1;
ALTER TABLE brand_guidelines ADD COLUMN IF NOT EXISTS row_version int NOT NULL DEFAULT 1;
ALTER TABLE approved_facts ADD COLUMN IF NOT EXISTS row_version int NOT NULL DEFAULT 1;
ALTER TABLE terminology ADD COLUMN IF NOT EXISTS row_version int NOT NULL DEFAULT 1;
ALTER TABLE content_submissions ADD COLUMN IF NOT EXISTS row_version int NOT NULL DEFAULT 1;

CREATE OR REPLACE FUNCTION increment_row_version()
RETURNS TRIGGER AS $$
BEGIN
  NEW.row_version = OLD.row_version + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_brand_profiles_version ON brand_profiles;
CREATE TRIGGER trg_brand_profiles_version
  BEFORE UPDATE ON brand_profiles
  FOR EACH ROW EXECUTE FUNCTION increment_row_version();

DROP TRIGGER IF EXISTS trg_brand_guidelines_version ON brand_guidelines;
CREATE TRIGGER trg_brand_guidelines_version
  BEFORE UPDATE ON brand_guidelines
  FOR EACH ROW EXECUTE FUNCTION increment_row_version();

DROP TRIGGER IF EXISTS trg_approved_facts_version ON approved_facts;
CREATE TRIGGER trg_approved_facts_version
  BEFORE UPDATE ON approved_facts
  FOR EACH ROW EXECUTE FUNCTION increment_row_version();

DROP TRIGGER IF EXISTS trg_terminology_version ON terminology;
CREATE TRIGGER trg_terminology_version
  BEFORE UPDATE ON terminology
  FOR EACH ROW EXECUTE FUNCTION increment_row_version();

DROP TRIGGER IF EXISTS trg_content_submissions_version ON content_submissions;
CREATE TRIGGER trg_content_submissions_version
  BEFORE UPDATE ON content_submissions
  FOR EACH ROW EXECUTE FUNCTION increment_row_version();

-- 6. Constraints: Unique version numbering per submission
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_content_versions_sub_ver'
  ) THEN
    ALTER TABLE content_versions ADD CONSTRAINT uq_content_versions_sub_ver UNIQUE (submission_id, version_no);
  END IF;
END $$;

-- 7. Immutability Triggers on append-only governance tables
CREATE OR REPLACE FUNCTION prevent_modification_or_delete()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Table % is strictly append-only. UPDATE and DELETE operations are forbidden.', TG_TABLE_NAME;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_immutable_approval_records ON approval_records;
CREATE TRIGGER trg_immutable_approval_records
  BEFORE UPDATE OR DELETE ON approval_records
  FOR EACH ROW EXECUTE FUNCTION prevent_modification_or_delete();

DROP TRIGGER IF EXISTS trg_immutable_audit_logs ON audit_logs;
CREATE TRIGGER trg_immutable_audit_logs
  BEFORE UPDATE OR DELETE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION prevent_modification_or_delete();

DROP TRIGGER IF EXISTS trg_immutable_content_versions ON content_versions;
CREATE TRIGGER trg_immutable_content_versions
  BEFORE UPDATE OR DELETE ON content_versions
  FOR EACH ROW EXECUTE FUNCTION prevent_modification_or_delete();
