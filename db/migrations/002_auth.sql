-- Migration 002: Authentication columns and constraints
ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_count int NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;

-- Add index on email for login lookup
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_org ON users(org_id);
