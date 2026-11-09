/**
 * INKLOOM AI - Production Database Migration Runner (Phase 2)
 * Connects via pg.Pool, verifies SHA256 checksums, and executes migrations
 * within atomic transactions with rollback protection.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { config } from '../server/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function computeSha256(content: string): string {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

export async function runMigrations(options: { statusOnly?: boolean } = {}): Promise<void> {
  const isStatusOnly = options.statusOnly || process.argv.includes('--status');
  console.log('=== INKLOOM AI - DATABASE MIGRATION ENGINE ===');
  console.log(`Environment: ${config.NODE_ENV}`);

  if (!config.DATABASE_URL) {
    if (config.NODE_ENV === 'production') {
      throw new Error('FATAL: DATABASE_URL is required in production.');
    }
    console.warn('DATABASE_URL is not configured. Running in local dry-run / verification mode.');
    const migrationsDir = path.resolve(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();
    console.log(`Verified ${files.length} migration files present and syntactically readable:`);
    files.forEach((f) => {
      const content = fs.readFileSync(path.join(migrationsDir, f), 'utf8');
      console.log(` - ${f} [SHA256: ${computeSha256(content).slice(0, 12)}...] (${content.length} bytes)`);
    });
    return;
  }

  const pool = new pg.Pool({
    connectionString: config.DATABASE_URL,
    ssl: config.DATABASE_SSL ? { rejectUnauthorized: false } : undefined,
    max: 5,
    idleTimeoutMillis: 10000,
  });

  const client = await pool.connect();
  try {
    // 1. Ensure schema_migrations table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name TEXT PRIMARY KEY,
        checksum TEXT NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        execution_time_ms INT NOT NULL
      );
    `);

    // 2. Fetch applied migrations
    const appliedResult = await client.query<{ name: string; checksum: string; applied_at: Date; execution_time_ms: number }>(
      'SELECT name, checksum, applied_at, execution_time_ms FROM schema_migrations ORDER BY name ASC'
    );
    const appliedMap = new Map(appliedResult.rows.map((r) => [r.name, r]));

    // 3. Read migration files
    const migrationsDir = path.resolve(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

    if (isStatusOnly) {
      console.log('\nMigration Status Report:');
      console.log('--------------------------------------------------------------------------------');
      console.log(
        'Status'.padEnd(10) +
        'Migration File'.padEnd(30) +
        'Applied At'.padEnd(25) +
        'Execution Time'
      );
      console.log('--------------------------------------------------------------------------------');
      for (const file of files) {
        const applied = appliedMap.get(file);
        const status = applied ? '[APPLIED]' : '[PENDING]';
        const appliedAt = applied ? applied.applied_at.toISOString() : 'Pending';
        const duration = applied ? `${applied.execution_time_ms} ms` : '-';
        console.log(status.padEnd(10) + file.padEnd(30) + appliedAt.padEnd(25) + duration);
      }
      console.log('--------------------------------------------------------------------------------');
      return;
    }

    console.log(`Checking ${files.length} migration files...`);

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      const checksum = computeSha256(sql);
      const applied = appliedMap.get(file);

      if (applied) {
        if (applied.checksum !== checksum) {
          throw new Error(
            `Migration checksum mismatch for ${file} - manual resolution required.\n` +
            `Expected: ${checksum}\n` +
            `Recorded: ${applied.checksum}`
          );
        }
        console.log(` [SKIPPED] ${file} (already applied at ${applied.applied_at.toISOString()})`);
      } else {
        console.log(` [RUNNING] Applying ${file}...`);
        const startTime = Date.now();
        await client.query('BEGIN');
        try {
          await client.query(sql);
          const durationMs = Date.now() - startTime;
          await client.query(
            'INSERT INTO schema_migrations (name, checksum, execution_time_ms) VALUES ($1, $2, $3)',
            [file, checksum, durationMs]
          );
          await client.query('COMMIT');
          console.log(` [SUCCESS] Applied ${file} in ${durationMs}ms [SHA256: ${checksum.slice(0, 12)}...]`);
        } catch (err) {
          await client.query('ROLLBACK');
          console.error(` [FAILED] Migration ${file} failed and was rolled back.`);
          throw err;
        }
      }
    }

    console.log('\nAll migrations completed successfully.');
  } finally {
    client.release();
    await pool.end();
  }
}

// CLI entrypoint
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMigrations().catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
}
