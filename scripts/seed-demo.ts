/**
 * INKLOOM AI - Demo Creative Seeder (scripts/seed-demo.ts)
 * Idempotently seeds demo submissions, approved local logo assets,
 * visual guidelines, and test creatives for judges.
 */

import fs from 'fs';
import path from 'path';
import {
  submissionRepo,
  versionRepo,
  assetRepo,
  guidelineRepo,
  profileRepo,
  userRepo,
} from '../server/db/repos';
import { SEED_PROFILE, SEED_USERS, SEED_ASSETS, SEED_GUIDELINES } from '../db/seed';
import { supabaseService } from '../src/services/supabase';

const MANIFEST_PATH = path.resolve(process.cwd(), 'demo-data/manifest.json');

export async function seedDemoData() {
  console.log('=== INKLOOM AI - DEMO DATA SEEDING ===');

  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error('manifest.json not found. Run generator first.');
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  const orgId = SEED_PROFILE.org_id;
  const ishaan = SEED_USERS.find((u) => u.user_id === 'u-creator-01') || SEED_USERS[1];

  // 1. Ensure approved local logo assets
  console.log('Seeding approved local logo assets...');
  for (const asset of SEED_ASSETS) {
    const existing = await assetRepo.list(SEED_PROFILE.profile_id, orgId);
    if (!existing.some((a) => a.asset_id === asset.asset_id)) {
      await assetRepo.create(asset);
    }
  }

  // 2. Ensure visual guidelines G-16, G-17, G-18
  console.log('Seeding visual guidelines...');
  const visualCodes = ['G-16', 'G-17', 'G-18'];
  for (const g of SEED_GUIDELINES.filter((item) => visualCodes.includes(item.code))) {
    const existing = await guidelineRepo.list(SEED_PROFILE.profile_id, orgId);
    if (!existing.some((item) => item.code === g.code)) {
      await guidelineRepo.create(g);
    }
  }

  // 3. Create submissions for demo cases
  console.log(`Seeding ${manifest.cases.length} ready-to-review demo submissions...`);
  for (let i = 0; i < manifest.cases.length; i++) {
    const c = manifest.cases[i];
    const subId = `sub-demo-visual-${c.id}`;
    const verId = `ver-${subId}-v1`;

    const existingSub = await submissionRepo.getById(subId, orgId);
    if (!existingSub) {
      await submissionRepo.create({
        submission_id: subId,
        profile_id: SEED_PROFILE.profile_id,
        creator_id: ishaan.user_id,
        creator_name: ishaan.full_name,
        title: `[Judge Demo] ${c.title}`,
        content_type: 'social_post',
        status: 'in_review',
        is_demo: true,
        created_at: new Date(Date.now() - (15 - i) * 3600000).toISOString(),
        updated_at: new Date(Date.now() - (15 - i) * 3600000).toISOString(),
      });

      await versionRepo.create({
        version_id: verId,
        submission_id: subId,
        version_no: 1,
        body_text: `Demo social graphic for "${c.title}". Automated visual brand audit test.`,
        media: [
          {
            name: c.filename,
            url: `/demo-assets/creatives/${c.filename}`,
            alt_text: c.filename.includes('missing_logo') ? null : `Promotional creative: ${c.title}`,
          },
        ],
        links: [],
        source: 'creator_submit',
        created_by: ishaan.user_id,
        created_by_name: ishaan.full_name,
        created_at: new Date(Date.now() - (15 - i) * 3600000).toISOString(),
      });
    }
  }

  // Remote Supabase synchronization if client available
  const client = supabaseService.getClient();
  if (client) {
    try {
      console.log('Synchronizing demo assets with Supabase...');
      for (const asset of SEED_ASSETS) {
        await client.from('brand_assets').upsert(asset, { onConflict: 'asset_id' });
      }
    } catch (e: any) {
      console.warn('Supabase remote sync note:', e.message);
    }
  }

  console.log('Demo seed completed successfully! Review Queue is populated with judge demo creatives.');
}

if (process.argv[1]?.endsWith('seed-demo.ts')) {
  seedDemoData().catch(console.error);
}
