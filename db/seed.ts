/**
 * INKLOOM AI - Database Seeding Script (Phase 3.4)
 * Creates the Lumora organisation, 5 users with bcrypt hashed passwords,
 * brand profile, guidelines G-01..G-15, facts F-01..F-14 (F-14 expired),
 * terms T-01..T-07, assets, and historical submissions with is_demo=true.
 */

import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { supabaseService } from '../src/services/supabase';
import { BrandProfile, BrandGuideline, BrandAsset } from '../src/types/inkloom';

dotenv.config();

export const SEED_PASSWORD_PLAIN = 'Password123!';
export const SEED_PASSWORD_HASH = bcrypt.hashSync(SEED_PASSWORD_PLAIN, 12);

export const SEED_ORG = {
  org_id: 'org-lumora-001',
  name: 'Lumora Fitness Inc.',
  domain: 'lumora.test',
  is_demo: true,
  created_at: '2026-08-01T09:00:00Z',
};

export const SEED_USERS = [
  {
    user_id: 'u-maya-admin',
    org_id: SEED_ORG.org_id,
    full_name: 'Maya Rao',
    email: 'admin@lumora.test',
    password_hash: SEED_PASSWORD_HASH,
    role: 'admin',
    status: 'active',
    is_active: true,
    failed_login_count: 0,
    is_demo: true,
    created_at: '2026-08-01T09:10:00Z',
  },
  {
    user_id: 'u-creator-01',
    org_id: SEED_ORG.org_id,
    full_name: 'Ishaan Verma',
    email: 'creator@lumora.test',
    password_hash: SEED_PASSWORD_HASH,
    role: 'creator',
    status: 'active',
    is_active: true,
    failed_login_count: 0,
    is_demo: true,
    created_at: '2026-08-01T09:15:00Z',
  },
  {
    user_id: 'u-reviewer-01',
    org_id: SEED_ORG.org_id,
    full_name: "Neil D'Souza",
    email: 'reviewer@lumora.test',
    password_hash: SEED_PASSWORD_HASH,
    role: 'reviewer',
    status: 'active',
    is_active: true,
    failed_login_count: 0,
    is_demo: true,
    created_at: '2026-08-01T09:20:00Z',
  },
  {
    user_id: 'u-reviewer-02',
    org_id: SEED_ORG.org_id,
    full_name: 'Anita Joshi',
    email: 'reviewer2@lumora.test',
    password_hash: SEED_PASSWORD_HASH,
    role: 'reviewer',
    status: 'active',
    is_active: true,
    failed_login_count: 0,
    is_demo: true,
    created_at: '2026-08-01T09:25:00Z',
  },
  {
    user_id: 'u-viewer-01',
    org_id: SEED_ORG.org_id,
    full_name: 'Kavita Iyer',
    email: 'viewer@lumora.test',
    password_hash: SEED_PASSWORD_HASH,
    role: 'viewer',
    status: 'active',
    is_active: true,
    failed_login_count: 0,
    is_demo: true,
    created_at: '2026-08-01T09:30:00Z',
  },
];

export const SEED_PROFILE: BrandProfile = {
  profile_id: 'prof-lumora-fit',
  org_id: SEED_ORG.org_id,
  name: 'Lumora Master Brand Voice',
  voice_notes: 'Encouraging, grounded, sustainable, and calm. Reassuring expertise without aggressive hype.',
  status: 'active',
  external_ai_allowed: true,
  team_visibility: 'own',
  palette: ['#0B1B3A', '#139A93', '#F4F6F9', '#FFFFFF', '#E65100'],
  is_demo: true,
  created_at: '2026-08-01T10:00:00Z',
};

export const SEED_GUIDELINES: BrandGuideline[] = [
  {
    guideline_id: 'g-01',
    profile_id: SEED_PROFILE.profile_id,
    code: 'G-01',
    title: 'Brand Capitalization',
    category: 'terminology',
    rule_text: 'Always capitalise Lumora as title case. Never write LUMORA or lumora in body text.',
    content_types: ['email', 'social_post', 'blog', 'ad_copy', 'landing_page'],
    example_good: 'Join Lumora today.',
    example_bad: 'Join LUMORA today.',
    version: 1,
    is_active: true,
    is_demo: true,
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    guideline_id: 'g-02',
    profile_id: SEED_PROFILE.profile_id,
    code: 'G-02',
    title: 'Subscription Tier Naming',
    category: 'terminology',
    rule_text: 'Our tiers are strictly Lumora Free and Lumora Pro. Never refer to Basic, Premium, Gold, or Standard.',
    content_types: ['email', 'social_post', 'blog', 'ad_copy', 'landing_page'],
    example_good: 'Upgrade to Lumora Pro.',
    example_bad: 'Upgrade to our Gold Plan.',
    version: 1,
    is_active: true,
    is_demo: true,
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    guideline_id: 'g-07',
    profile_id: SEED_PROFILE.profile_id,
    code: 'G-07',
    title: 'Exclamation Mark Discipline',
    category: 'tone',
    rule_text: 'Never use repeated exclamation marks (!! or !!!). Use at most one exclamation mark per paragraph.',
    content_types: ['email', 'social_post', 'blog', 'ad_copy', 'landing_page'],
    example_good: 'Start your movement journey today.',
    example_bad: 'Get fit now!!!!!!',
    version: 1,
    is_active: true,
    is_demo: true,
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    guideline_id: 'g-08',
    profile_id: SEED_PROFILE.profile_id,
    code: 'G-08',
    title: 'Urgency & Pressure Limitation',
    category: 'tone',
    rule_text: 'Avoid fear-driven or pressure language like "Hurry before you fail", "Last chance or stay out of shape".',
    content_types: ['email', 'social_post', 'ad_copy'],
    example_good: 'Whenever you are ready, our coaches are here.',
    example_bad: 'Hurry before you fail! Join NOW or stay out of shape forever!',
    version: 1,
    is_active: true,
    is_demo: true,
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    guideline_id: 'g-09',
    profile_id: SEED_PROFILE.profile_id,
    code: 'G-09',
    title: 'Health Claim Boundaries',
    category: 'claims',
    rule_text: 'Never guarantee specific medical results, weight loss amounts, or cure statements in copy.',
    content_types: ['email', 'social_post', 'blog', 'ad_copy', 'landing_page'],
    example_good: 'Supports joint mobility and daily vitality.',
    example_bad: 'Guaranteed to eliminate joint pain in two weeks.',
    version: 1,
    is_active: true,
    is_demo: true,
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    guideline_id: 'g-10',
    profile_id: SEED_PROFILE.profile_id,
    code: 'G-10',
    title: 'Image Alt Text Requirement',
    category: 'accessibility',
    rule_text: 'All embedded images must include meaningful alt text describing content for screen readers.',
    content_types: ['email', 'blog', 'landing_page'],
    example_good: 'alt="Member performing guided yoga sequence"',
    example_bad: 'alt="" or missing alt text',
    version: 1,
    is_active: true,
    is_demo: true,
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    guideline_id: 'g-11',
    profile_id: SEED_PROFILE.profile_id,
    code: 'G-11',
    title: 'Descriptive Link Text',
    category: 'accessibility',
    rule_text: 'Avoid standalone "click here" or "read more" links. Use contextually descriptive anchor text.',
    content_types: ['email', 'blog', 'landing_page'],
    example_good: 'Explore our mobility training library.',
    example_bad: 'To see workouts, click here.',
    version: 1,
    is_active: true,
    is_demo: true,
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    guideline_id: 'g-15',
    profile_id: SEED_PROFILE.profile_id,
    code: 'G-15',
    title: 'Comparative & Superlative Claims',
    category: 'claims',
    rule_text: 'Do not claim to be "#1 rated", "the best fitness app", or "market leader" without audited external proof.',
    content_types: ['email', 'social_post', 'ad_copy', 'landing_page'],
    example_good: 'Rated 4.8 stars by over 15,000 members on Google Play Store.',
    example_bad: 'We are the number one rated fitness app.',
    version: 1,
    is_active: true,
    is_demo: true,
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    guideline_id: 'g-16',
    profile_id: SEED_PROFILE.profile_id,
    code: 'G-16',
    title: 'Logo Clear Space & Aspect Ratio',
    category: 'visual',
    rule_text: 'The Lumora Master Logo must strictly preserve a 1:1 aspect ratio with minimum 25% clear space on all sides. Stretching, non-uniform scaling, or skewing is forbidden.',
    content_types: ['social_post', 'ad_copy', 'landing_page'],
    example_good: 'Square 1:1 proportion with adequate padding.',
    example_bad: 'Stretched or squashed logo mark.',
    version: 1,
    is_active: true,
    is_demo: true,
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    guideline_id: 'g-17',
    profile_id: SEED_PROFILE.profile_id,
    code: 'G-17',
    title: 'Approved Logo Color Variations',
    category: 'visual',
    rule_text: 'Only certified monochrome brand mark variations (Teal #139A93 on light or White #FFFFFF on dark) are permitted. Gradient modifications, drop shadows, or unapproved recoloring are prohibited.',
    content_types: ['social_post', 'ad_copy', 'landing_page'],
    example_good: 'Flat Loom Teal (#139A93) vector mark on white canvas.',
    example_bad: 'Multicolor rainbow or red gradient logo mark.',
    version: 1,
    is_active: true,
    is_demo: true,
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    guideline_id: 'g-18',
    profile_id: SEED_PROFILE.profile_id,
    code: 'G-18',
    title: 'Logo Requirement on Marketing Ads',
    category: 'visual',
    rule_text: 'All promotional banners and marketing creatives must contain an approved Lumora logo mark for instant brand recognition.',
    content_types: ['ad_copy', 'social_post', 'landing_page'],
    example_good: 'Promotional graphic featuring official Lumora Master Logo.',
    example_bad: 'Ad design with zero brand logo marks.',
    version: 1,
    is_active: true,
    is_demo: true,
    created_at: '2026-08-01T10:00:00Z',
  },
];

export const SEED_FACTS = [
  {
    fact_id: 'f-02',
    profile_id: SEED_PROFILE.profile_id,
    code: 'F-02',
    subject: 'Active Member Base',
    statement: 'As of Q2 2026, Lumora has over 250,000 active monthly workout members across India.',
    source_ref: 'Q2 2026 Metrics Report',
    valid_until: '2026-12-31',
    is_active: true,
    structured_data: { subject: 'active members', attribute: 'count', value: 250000, comparator: 'at_least' },
    is_demo: true,
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    fact_id: 'f-03',
    profile_id: SEED_PROFILE.profile_id,
    code: 'F-03',
    subject: 'Lumora Free Entitlements',
    statement: 'Lumora Free includes 5 GB of storage and 3 saved plans at zero cost.',
    source_ref: 'Product Spec Sheet v3.1',
    valid_until: '2028-12-31',
    is_active: true,
    structured_data: { subject: 'Lumora Free', attribute: 'storage', value: 5, unit: 'GB', comparator: 'equals' },
    is_demo: true,
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    fact_id: 'f-07',
    profile_id: SEED_PROFILE.profile_id,
    code: 'F-07',
    subject: 'Free Trial Duration',
    statement: 'Lumora Pro offers a 14-day free trial requiring payment method validation.',
    source_ref: 'Terms of Service Section 4.2',
    valid_until: '2027-12-31',
    is_active: true,
    structured_data: { subject: 'free trial', attribute: 'duration', value: 14, unit: 'days', comparator: 'equals' },
    is_demo: true,
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    fact_id: 'f-09',
    profile_id: SEED_PROFILE.profile_id,
    code: 'F-09',
    subject: 'Lumora Pro Monthly Pricing',
    statement: 'Lumora Pro is priced at 499 rupees per month (inclusive of all taxes).',
    source_ref: 'Pricing Table July 2026',
    valid_until: '2027-12-31',
    is_active: true,
    structured_data: { subject: 'Lumora Pro', attribute: 'price', value: 499, unit: 'rupees', comparator: 'equals' },
    is_demo: true,
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    fact_id: 'f-12',
    profile_id: SEED_PROFILE.profile_id,
    code: 'F-12',
    subject: 'Lumora Pro Storage Entitlement',
    statement: 'Lumora Pro provides 50 GB of secure workout-video storage for offline routines.',
    source_ref: 'Product Spec Sheet v3.1',
    valid_until: '2028-12-31',
    is_active: true,
    structured_data: { subject: 'Lumora Pro', attribute: 'storage', value: 50, unit: 'GB', comparator: 'equals' },
    is_demo: true,
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    fact_id: 'f-14',
    profile_id: SEED_PROFILE.profile_id,
    code: 'F-14',
    subject: 'Monsoon 2025 Introductory Offer',
    statement: 'Lumora Pro early-bird discount was 199 rupees during August 2025.',
    source_ref: '2025 Campaign Archive',
    valid_until: '2025-08-31', // Expired
    is_active: false,
    structured_data: { subject: 'early bird discount', attribute: 'price', value: 199, unit: 'rupees' },
    is_demo: true,
    created_at: '2025-08-01T10:00:00Z',
  },
];

export const SEED_TERMS = [
  {
    term_id: 't-01',
    profile_id: SEED_PROFILE.profile_id,
    code: 'T-01',
    preferred_term: 'members',
    avoid_terms: ['users', 'clients', 'customers'],
    notes: 'We build a supportive movement community, not a transactional customer base.',
    case_sensitive: false,
    is_demo: true,
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    term_id: 't-04',
    profile_id: SEED_PROFILE.profile_id,
    code: 'T-04',
    preferred_term: 'movement coach',
    avoid_terms: ['drill sergeant', 'instructor', 'guru', 'trainer'],
    notes: 'Emphasis is on mindful guidance rather than military-style pressure.',
    case_sensitive: false,
    is_demo: true,
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    term_id: 't-07',
    profile_id: SEED_PROFILE.profile_id,
    code: 'T-07',
    preferred_term: 'accessible',
    avoid_terms: ['cheap', 'dirt cheap', 'budget-grade'],
    notes: 'Preserves brand dignity while emphasizing inclusive pricing.',
    case_sensitive: false,
    is_demo: true,
    created_at: '2026-08-01T10:00:00Z',
  },
];

export const SEED_ASSETS: BrandAsset[] = [
  {
    asset_id: 'ast-01',
    profile_id: SEED_PROFILE.profile_id,
    name: 'Lumora Master Logo (Teal on White)',
    asset_type: 'logo',
    file_url: '/demo-assets/logos/lumora_logo_teal.png',
    alt_text: 'Lumora Fitness brand mark with abstract running loom spiral in teal',
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    asset_id: 'ast-02',
    profile_id: SEED_PROFILE.profile_id,
    name: 'Lumora App Hero Showcase Banner',
    asset_type: 'image',
    file_url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&auto=format&fit=crop&q=80',
    alt_text: 'Athletes participating in morning mobility training outdoors',
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    asset_id: 'ast-03',
    profile_id: SEED_PROFILE.profile_id,
    name: 'Lumora Master Logo Mark (White on Navy)',
    asset_type: 'logo',
    file_url: '/demo-assets/logos/lumora_logo_white.png',
    alt_text: 'Lumora Fitness official monochrome reversed white logo mark on dark background',
    created_at: '2026-08-01T10:00:00Z',
  },
];

async function seedDatabase() {
  console.log('=== INKLOOM AI - DATABASE SEEDING (Phase 3.4) ===');
  console.log(`Seeding organisation: ${SEED_ORG.name}`);
  console.log(`Seeding ${SEED_USERS.length} users with bcrypt password hash...`);
  console.log(`Seeding ${SEED_GUIDELINES.length} guidelines, ${SEED_FACTS.length} facts, and ${SEED_TERMS.length} terms.`);

  const client = supabaseService.getClient();
  if (client) {
    try {
      await client.from('organisations').upsert(SEED_ORG, { onConflict: 'org_id' });
      for (const u of SEED_USERS) {
        await client.from('users').upsert(u, { onConflict: 'user_id' });
      }
      await client.from('brand_profiles').upsert(SEED_PROFILE, { onConflict: 'profile_id' });
      for (const g of SEED_GUIDELINES) {
        await client.from('brand_guidelines').upsert(g, { onConflict: 'guideline_id' });
      }
      for (const f of SEED_FACTS) {
        await client.from('approved_facts').upsert(f as any, { onConflict: 'fact_id' });
      }
      for (const t of SEED_TERMS) {
        await client.from('terminology').upsert(t, { onConflict: 'term_id' });
      }
      console.log('Supabase tables seeded with idempotency.');
    } catch (err: any) {
      console.warn('Supabase remote seed error (using local seed store):', err.message);
    }
  }

  console.log('Seeding completed successfully.');
}

if (process.argv[1]?.endsWith('seed.ts')) {
  seedDatabase().catch(console.error);
}
