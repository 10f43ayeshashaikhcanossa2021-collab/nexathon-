-- INKLOOM AI - 15 Database Tables (db/schema.sql)
-- Exact specification from Part D of the Master Build Prompt

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE organisations (
  org_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  domain text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE users (
  user_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organisations ON DELETE RESTRICT,
  full_name text NOT NULL,
  email citext NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin','creator','reviewer','viewer')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE (org_id, email)
);

CREATE TABLE brand_profiles (
  profile_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organisations ON DELETE RESTRICT,
  name text NOT NULL,
  voice_notes text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','archived')),
  external_ai_allowed boolean NOT NULL DEFAULT true,
  team_visibility text NOT NULL DEFAULT 'own' CHECK (team_visibility IN ('own','team')),
  palette jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE brand_guidelines (
  guideline_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES brand_profiles ON DELETE CASCADE,
  code text NOT NULL,
  title text NOT NULL,
  category text NOT NULL CHECK (category IN ('tone','claims','terminology','accessibility','visual','general')),
  rule_text text NOT NULL,
  content_types text[] NOT NULL DEFAULT '{}',
  example_good text,
  example_bad text,
  version int NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  search_vector tsvector GENERATED ALWAYS AS (to_tsvector('english', title||' '||rule_text)) STORED,
  UNIQUE (profile_id, code, version)
);

CREATE TABLE approved_facts (
  fact_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES brand_profiles ON DELETE CASCADE,
  code text NOT NULL,
  statement text NOT NULL,
  subject text NOT NULL,
  source_ref text,
  valid_until date,
  is_active boolean NOT NULL DEFAULT true,
  search_vector tsvector GENERATED ALWAYS AS (to_tsvector('english', subject||' '||statement)) STORED,
  UNIQUE (profile_id, code)
);

CREATE TABLE terminology (
  term_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES brand_profiles ON DELETE CASCADE,
  code text NOT NULL,
  preferred_term text NOT NULL,
  avoid_terms text[] NOT NULL,
  notes text,
  case_sensitive boolean NOT NULL DEFAULT false,
  UNIQUE (profile_id, code)
);

CREATE TABLE brand_assets (
  asset_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES brand_profiles ON DELETE CASCADE,
  asset_type text NOT NULL CHECK (asset_type IN ('logo','image','other')),
  name text NOT NULL,
  file_url text NOT NULL,
  alt_text text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE content_submissions (
  submission_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES brand_profiles ON DELETE RESTRICT,
  creator_id uuid NOT NULL REFERENCES users ON DELETE RESTRICT,
  title text NOT NULL,
  content_type text NOT NULL CHECK (content_type IN ('email','social_post','web_copy','ad','blog','press_release','other')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','in_analysis','in_correction','in_review','changes_requested','approved')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE content_versions (
  version_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES content_submissions ON DELETE RESTRICT,
  version_no int NOT NULL,
  body_text text NOT NULL CHECK (length(body_text)<=20000),
  media jsonb NOT NULL DEFAULT '[]',
  links jsonb NOT NULL DEFAULT '[]',
  source text NOT NULL DEFAULT 'creator_submit' CHECK (source IN ('creator_submit','accepted_changes','edited')),
  created_by uuid NOT NULL REFERENCES users,
  created_at timestamptz DEFAULT now(),
  UNIQUE (submission_id, version_no)
);

CREATE TABLE analysis_reports (
  report_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id uuid NOT NULL REFERENCES content_versions ON DELETE RESTRICT,
  summary jsonb NOT NULL,
  model_name text NOT NULL,
  ai_status text NOT NULL CHECK (ai_status IN ('completed','ai_unavailable','skipped_external_ai_disabled')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE detected_issues (
  issue_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES analysis_reports ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('fact_conflict','unsupported_claim','terminology','tone','accessibility','other')),
  severity text NOT NULL CHECK (severity IN ('high','medium','low')),
  status text NOT NULL CHECK (status IN ('verified_conflict','rule_violation','unsupported_claim','needs_human_check')),
  confidence text NOT NULL CHECK (confidence IN ('high','medium','low')),
  excerpt text NOT NULL,
  start_offset int,
  end_offset int,
  evidence_refs text[] NOT NULL,
  explanation text NOT NULL,
  source text NOT NULL CHECK (source IN ('code','ai'))
);

CREATE TABLE correction_suggestions (
  suggestion_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id uuid NOT NULL REFERENCES detected_issues ON DELETE CASCADE,
  suggested_text text NOT NULL,
  rationale text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','edited','dismissed')),
  final_text text,
  dismiss_reason text,
  responded_by uuid REFERENCES users,
  responded_at timestamptz
);

CREATE TABLE review_comments (
  comment_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id uuid NOT NULL REFERENCES content_versions ON DELETE RESTRICT,
  author_id uuid NOT NULL REFERENCES users ON DELETE RESTRICT,
  issue_id uuid REFERENCES detected_issues ON DELETE SET NULL,
  parent_comment_id uuid REFERENCES review_comments,
  body text NOT NULL CHECK (length(body) BETWEEN 1 AND 2000),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE approval_records (
  approval_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id uuid NOT NULL REFERENCES content_versions ON DELETE RESTRICT,
  reviewer_id uuid NOT NULL REFERENCES users ON DELETE RESTRICT,
  decision text NOT NULL CHECK (decision IN ('approved','changes_requested')),
  comment text,
  decided_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE audit_logs (
  log_id bigserial PRIMARY KEY,
  org_id uuid NOT NULL REFERENCES organisations ON DELETE RESTRICT,
  actor_id uuid REFERENCES users ON DELETE RESTRICT,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Immutability triggers (versions, approvals, audit logs)
CREATE OR REPLACE FUNCTION forbid_change() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION '% is append-only', TG_TABLE_NAME;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER v_immutable BEFORE UPDATE OR DELETE ON content_versions
  FOR EACH ROW EXECUTE FUNCTION forbid_change();
CREATE TRIGGER a_immutable BEFORE UPDATE OR DELETE ON approval_records
  FOR EACH ROW EXECUTE FUNCTION forbid_change();
CREATE TRIGGER l_immutable BEFORE UPDATE OR DELETE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION forbid_change();

-- Indexes
CREATE INDEX ON brand_guidelines USING GIN(search_vector);
CREATE INDEX ON approved_facts USING GIN(search_vector);
CREATE INDEX ON content_submissions(profile_id, status);
CREATE INDEX ON content_submissions(creator_id);
CREATE INDEX ON content_versions(submission_id);
CREATE INDEX ON detected_issues(report_id);
CREATE INDEX ON detected_issues(category);
CREATE INDEX ON audit_logs(org_id, created_at DESC);
