-- Migration 001: Initial Core Schema (15 Tables)
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE IF NOT EXISTS organisations (
  org_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  domain text,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  user_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organisations ON DELETE RESTRICT,
  full_name text NOT NULL,
  email citext NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin','creator','reviewer','viewer')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','deactivated')),
  is_active boolean NOT NULL DEFAULT true,
  failed_login_count int NOT NULL DEFAULT 0,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE (org_id, email)
);

CREATE TABLE IF NOT EXISTS brand_profiles (
  profile_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organisations ON DELETE RESTRICT,
  name text NOT NULL,
  voice_notes text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','archived')),
  external_ai_allowed boolean NOT NULL DEFAULT true,
  team_visibility text NOT NULL DEFAULT 'own' CHECK (team_visibility IN ('own','team')),
  palette jsonb NOT NULL DEFAULT '[]',
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS brand_guidelines (
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
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE (profile_id, code, version)
);

CREATE TABLE IF NOT EXISTS approved_facts (
  fact_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES brand_profiles ON DELETE CASCADE,
  code text NOT NULL,
  statement text NOT NULL,
  subject text NOT NULL,
  source_ref text,
  valid_until date,
  is_active boolean NOT NULL DEFAULT true,
  structured_data jsonb DEFAULT '{}',
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE (profile_id, code)
);

CREATE TABLE IF NOT EXISTS terminology (
  term_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES brand_profiles ON DELETE CASCADE,
  code text NOT NULL,
  preferred_term text NOT NULL,
  avoid_terms text[] NOT NULL,
  notes text,
  case_sensitive boolean NOT NULL DEFAULT false,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE (profile_id, code)
);

CREATE TABLE IF NOT EXISTS brand_assets (
  asset_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES brand_profiles ON DELETE CASCADE,
  asset_type text NOT NULL CHECK (asset_type IN ('logo','image','other')),
  name text NOT NULL,
  file_url text NOT NULL,
  alt_text text,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS content_submissions (
  submission_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES brand_profiles ON DELETE RESTRICT,
  creator_id uuid NOT NULL REFERENCES users ON DELETE RESTRICT,
  title text NOT NULL,
  content_type text NOT NULL CHECK (content_type IN ('email','social_post','web_copy','ad','blog','press_release','other')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','in_analysis','in_correction','in_review','changes_requested','approved')),
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS content_versions (
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

CREATE TABLE IF NOT EXISTS analysis_reports (
  report_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id uuid NOT NULL REFERENCES content_versions ON DELETE RESTRICT,
  summary jsonb NOT NULL,
  model_name text NOT NULL,
  ai_status text NOT NULL CHECK (ai_status IN ('completed','ai_unavailable','skipped_external_ai_disabled')),
  sent_reference_codes text[] DEFAULT '{}',
  dropped_findings jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS detected_issues (
  issue_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES analysis_reports ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('fact_conflict','unsupported_claim','terminology','tone','accessibility','prompt_injection_attempt','other')),
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

CREATE TABLE IF NOT EXISTS correction_suggestions (
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

CREATE TABLE IF NOT EXISTS review_comments (
  comment_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id uuid NOT NULL REFERENCES content_versions ON DELETE RESTRICT,
  author_id uuid NOT NULL REFERENCES users ON DELETE RESTRICT,
  issue_id uuid REFERENCES detected_issues ON DELETE SET NULL,
  parent_comment_id uuid REFERENCES review_comments,
  body text NOT NULL CHECK (length(body) BETWEEN 1 AND 2000),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS approval_records (
  approval_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id uuid NOT NULL REFERENCES content_versions ON DELETE RESTRICT,
  reviewer_id uuid NOT NULL REFERENCES users ON DELETE RESTRICT,
  decision text NOT NULL CHECK (decision IN ('approved','changes_requested')),
  comment text NOT NULL,
  visual_checklist jsonb DEFAULT '{}',
  decided_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  log_id bigserial PRIMARY KEY,
  org_id uuid NOT NULL REFERENCES organisations ON DELETE RESTRICT,
  actor_id uuid REFERENCES users ON DELETE RESTRICT,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  metadata jsonb NOT NULL DEFAULT '{}',
  ip_hash text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS social_accounts (
  account_id text PRIMARY KEY,
  org_id uuid NOT NULL REFERENCES organisations ON DELETE RESTRICT,
  provider text NOT NULL,
  external_account_id text NOT NULL,
  display_name text NOT NULL,
  account_handle text,
  account_type text NOT NULL DEFAULT 'page',
  granted_scopes text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'connected',
  profile_picture_url text,
  last_verified_at timestamptz NOT NULL DEFAULT now(),
  owner_id uuid NOT NULL REFERENCES users,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS publish_jobs (
  job_id text PRIMARY KEY,
  variant_id text NOT NULL,
  account_id text NOT NULL REFERENCES social_accounts ON DELETE CASCADE,
  submission_id uuid NOT NULL REFERENCES content_submissions ON DELETE RESTRICT,
  submission_title text NOT NULL,
  provider text NOT NULL,
  caption text NOT NULL,
  media_urls text[] DEFAULT '{}',
  scheduled_time timestamptz NOT NULL,
  timezone text NOT NULL DEFAULT 'UTC',
  status text NOT NULL DEFAULT 'scheduled',
  retry_count int NOT NULL DEFAULT 0,
  idempotency_key text NOT NULL UNIQUE,
  last_error text,
  created_by uuid NOT NULL REFERENCES users,
  created_by_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  executed_at timestamptz
);
