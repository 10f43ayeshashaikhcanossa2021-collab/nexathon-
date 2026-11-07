-- Migration 005: Full-Text Search and Performance Indexes
-- Generated tsvector columns and GIN indexes for AI retrieval & tenant lookup

CREATE INDEX IF NOT EXISTS idx_submissions_profile_status ON content_submissions(profile_id, status);
CREATE INDEX IF NOT EXISTS idx_submissions_creator ON content_submissions(creator_id);
CREATE INDEX IF NOT EXISTS idx_versions_submission ON content_versions(submission_id);
CREATE INDEX IF NOT EXISTS idx_detected_issues_report ON detected_issues(report_id);
CREATE INDEX IF NOT EXISTS idx_detected_issues_category ON detected_issues(category);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_created ON audit_logs(org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_brand_guidelines_profile ON brand_guidelines(profile_id);
CREATE INDEX IF NOT EXISTS idx_approved_facts_profile ON approved_facts(profile_id);
