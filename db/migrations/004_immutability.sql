-- Migration 004: Immutability Triggers (Phase 3.3)
-- Ensures content_versions, audit_logs, and approval_records are strictly append-only

CREATE OR REPLACE FUNCTION forbid_update() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'Table % is append-only', TG_TABLE_NAME;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS versions_no_update ON content_versions;
CREATE TRIGGER versions_no_update BEFORE UPDATE OR DELETE ON content_versions
  FOR EACH ROW EXECUTE FUNCTION forbid_update();

DROP TRIGGER IF EXISTS audit_no_update ON audit_logs;
CREATE TRIGGER audit_no_update BEFORE UPDATE OR DELETE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION forbid_update();

DROP TRIGGER IF EXISTS approvals_no_update ON approval_records;
CREATE TRIGGER approvals_no_update BEFORE UPDATE OR DELETE ON approval_records
  FOR EACH ROW EXECUTE FUNCTION forbid_update();
