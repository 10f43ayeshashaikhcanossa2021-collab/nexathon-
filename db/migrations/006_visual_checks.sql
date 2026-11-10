-- Migration 006: Automated Visual Brand Checks & Review Persistence
-- Real pixel-level analysis persistence, append-only reviews, and tenant isolation

CREATE TABLE IF NOT EXISTS visual_check_reports (
  report_id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  version_id TEXT NOT NULL,
  submission_id TEXT NOT NULL,
  media_name TEXT NOT NULL,
  image_sha256 TEXT NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  status TEXT NOT NULL,
  overall_compliance TEXT NOT NULL,
  provider TEXT NOT NULL,
  model TEXT,
  engine_version TEXT NOT NULL,
  summary JSONB NOT NULL,
  extracted_colors JSONB NOT NULL,
  detected_logos JSONB NOT NULL,
  timings JSONB NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS visual_issues (
  issue_id TEXT PRIMARY KEY,
  report_id TEXT NOT NULL REFERENCES visual_check_reports(report_id) ON DELETE CASCADE,
  org_id TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  severity TEXT NOT NULL,
  confidence NUMERIC NOT NULL,
  confidence_basis JSONB,
  description TEXT NOT NULL,
  expected_rule TEXT NOT NULL,
  detected_result TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  region JSONB,
  color_comparison JSONB,
  logo_comparison JSONB,
  source TEXT NOT NULL, -- 'deterministic' | 'ai' | 'fused'
  classification TEXT NOT NULL, -- 'violation' | 'possible_concern'
  review_status TEXT NOT NULL DEFAULT 'unreviewed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS visual_issue_reviews (
  review_id TEXT PRIMARY KEY,
  issue_id TEXT NOT NULL REFERENCES visual_issues(issue_id) ON DELETE CASCADE,
  org_id TEXT NOT NULL,
  reviewer_id TEXT NOT NULL,
  decision TEXT NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE visual_check_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE visual_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE visual_issue_reviews ENABLE ROW LEVEL SECURITY;

-- Append-only trigger on visual_issue_reviews
DROP TRIGGER IF EXISTS visual_reviews_no_update ON visual_issue_reviews;
CREATE TRIGGER visual_reviews_no_update BEFORE UPDATE OR DELETE ON visual_issue_reviews
  FOR EACH ROW EXECUTE FUNCTION forbid_update();

-- Indexes for fast lookup & reporting
CREATE INDEX IF NOT EXISTS idx_visual_reports_version ON visual_check_reports(version_id);
CREATE INDEX IF NOT EXISTS idx_visual_reports_org ON visual_check_reports(org_id);
CREATE INDEX IF NOT EXISTS idx_visual_reports_sha ON visual_check_reports(image_sha256);
CREATE INDEX IF NOT EXISTS idx_visual_issues_report ON visual_issues(report_id);
CREATE INDEX IF NOT EXISTS idx_visual_issues_org ON visual_issues(org_id);
CREATE INDEX IF NOT EXISTS idx_visual_issue_reviews_issue ON visual_issue_reviews(issue_id);
