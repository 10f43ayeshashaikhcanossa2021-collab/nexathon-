-- Migration 007: Row Level Security as Defense in Depth (Phase 3)
-- Enables and forces RLS on all tenant-isolated tables using app.current_org.

DO $$
DECLARE
  tbl text;
  tenant_tables text[] := ARRAY[
    'users',
    'brand_profiles',
    'brand_guidelines',
    'approved_facts',
    'terminology',
    'brand_assets',
    'content_submissions',
    'content_versions',
    'analysis_reports',
    'detected_issues',
    'correction_suggestions',
    'review_comments',
    'approval_records',
    'audit_logs',
    'auth_sessions',
    'social_accounts',
    'publish_jobs'
  ];
BEGIN
  -- Enable and force RLS on organisations
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'organisations') THEN
    EXECUTE 'ALTER TABLE organisations ENABLE ROW LEVEL SECURITY';
    EXECUTE 'ALTER TABLE organisations FORCE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS tenant_isolation_policy_orgs ON organisations';
    EXECUTE 'CREATE POLICY tenant_isolation_policy_orgs ON organisations
      USING (org_id = nullif(current_setting(''app.current_org'', true), '''')::uuid)
      WITH CHECK (org_id = nullif(current_setting(''app.current_org'', true), '''')::uuid)';
  END IF;

  -- Enable and force RLS on all tenant child tables
  FOREACH tbl IN ARRAY tenant_tables LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
      EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', tbl);
      EXECUTE format('DROP POLICY IF EXISTS tenant_isolation_policy_%I ON %I', tbl, tbl);
      EXECUTE format('CREATE POLICY tenant_isolation_policy_%I ON %I
        USING (org_id = nullif(current_setting(''app.current_org'', true), '''')::uuid)
        WITH CHECK (org_id = nullif(current_setting(''app.current_org'', true), '''')::uuid)', tbl, tbl);
    END IF;
  END LOOP;
END $$;

-- Revoke public privileges to prevent direct anonymous reads
DO $$
BEGIN
  REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON ALL TABLES IN SCHEMA public FROM authenticated;
  END IF;
END $$;
