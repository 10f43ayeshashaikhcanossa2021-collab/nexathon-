-- Migration 003: Row Level Security (RLS) Policies
-- Patterns required by Phase 3.3 for tenant data isolation

ALTER TABLE organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_guidelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE approved_facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE terminology ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE detected_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE correction_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE publish_jobs ENABLE ROW LEVEL SECURITY;

-- Tenant Isolation Policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'org_isolation' AND tablename = 'organisations') THEN
    CREATE POLICY org_isolation ON organisations FOR ALL
      USING (org_id = (current_setting('app.current_org', true))::uuid);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'user_org_isolation' AND tablename = 'users') THEN
    CREATE POLICY user_org_isolation ON users FOR ALL
      USING (org_id = (current_setting('app.current_org', true))::uuid);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'profile_org_isolation' AND tablename = 'brand_profiles') THEN
    CREATE POLICY profile_org_isolation ON brand_profiles FOR ALL
      USING (org_id = (current_setting('app.current_org', true))::uuid);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'audit_org_isolation' AND tablename = 'audit_logs') THEN
    CREATE POLICY audit_org_isolation ON audit_logs FOR ALL
      USING (org_id = (current_setting('app.current_org', true))::uuid);
  END IF;
END $$;
