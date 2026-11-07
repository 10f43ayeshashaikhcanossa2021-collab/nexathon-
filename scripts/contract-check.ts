/**
 * INKLOOM AI - Contract Check Script (Phase 2 Acceptance)
 * Reads docs/API_CONTRACT.md, extracts every method + path,
 * and validates that the Express app registers every route.
 */

process.env.CONTRACT_CHECK = 'true';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { app } from '../server';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function checkContract() {
  console.log('=== INKLOOM AI - API CONTRACT VERIFICATION ===\n');

  const contractPath = path.resolve(__dirname, '../docs/API_CONTRACT.md');
  const contractContent = fs.readFileSync(contractPath, 'utf8');

  // Extract table rows: | `METHOD` | `/path` | ...
  const regex = /\|\s*`([A-Z]+)`\s*\|\s*`([^`]+)`\s*\|/g;
  const contractRoutes: { method: string; path: string }[] = [];

  let match: RegExpExecArray | null;
  while ((match = regex.exec(contractContent)) !== null) {
    contractRoutes.push({
      method: match[1].toLowerCase(),
      path: match[2].startsWith('/api') ? match[2] : `/api${match[2]}`,
    });
  }

  console.log(`Extracted ${contractRoutes.length} endpoints from docs/API_CONTRACT.md:`);

  // Extract registered routes from Express app router
  const registeredRoutes: { method: string; path: string }[] = [];
  app._router.stack.forEach((middleware: any) => {
    if (middleware.route) {
      const methods = Object.keys(middleware.route.methods);
      methods.forEach((m) => {
        registeredRoutes.push({
          method: m.toLowerCase(),
          path: middleware.route.path,
        });
      });
    }
  });

  let missing = 0;

  for (const cr of contractRoutes) {
    const found = registeredRoutes.some((rr) => {
      if (rr.method !== cr.method) return false;

      // Handle path parameters e.g. :id
      const normalize = (p: string) => p.replace(/:[a-zA-Z0-9_]+/g, ':param').replace(/\/$/, '');
      return normalize(rr.path) === normalize(cr.path);
    });

    if (found) {
      console.log(` ✓ [${cr.method.toUpperCase()}] ${cr.path}`);
    } else {
      console.error(` ✗ MISSING: [${cr.method.toUpperCase()}] ${cr.path}`);
      missing++;
    }
  }

  console.log('\n----------------------------------------------');
  if (missing === 0) {
    console.log(`✓ All ${contractRoutes.length} API endpoints verified and registered on server.`);
    process.exit(0);
  } else {
    console.error(`✗ Failed: ${missing} endpoints from API_CONTRACT.md are missing from server.ts`);
    process.exit(1);
  }
}

checkContract().catch((err) => {
  console.error(err);
  process.exit(1);
});
