/**
 * INKLOOM AI - In-Memory & Reactive Store with Lumora Fitness Seed Dataset
 */

import {
  User,
  Organisation,
  BrandProfile,
  BrandGuideline,
  ApprovedFact,
  TerminologyItem,
  BrandAsset,
  ContentSubmission,
  ContentVersion,
  AnalysisReport,
  DetectedIssue,
  ReviewComment,
  ApprovalRecord,
  AuditLog,
  LabelledTestCase,
  SocialAccount,
  SocialPostVariant,
  PublishJob,
  PublishJobStatus,
  PublishResult,
  SocialProvider,
} from '../types/inkloom';

const DEFAULT_ORG: Organisation = {
  org_id: 'org-lumora-001',
  name: 'Lumora Fitness Inc.',
  domain: 'lumora.test',
  created_at: '2026-08-01T09:00:00Z',
};

export const SEED_USERS: User[] = [
  {
    user_id: 'u-maya-admin',
    org_id: DEFAULT_ORG.org_id,
    full_name: 'Maya Rao',
    email: 'admin@lumora.test',
    role: 'admin',
    is_active: true,
    created_at: '2026-08-01T09:10:00Z',
  },
  {
    user_id: 'u-ishaan-creator',
    org_id: DEFAULT_ORG.org_id,
    full_name: 'Ishaan Verma',
    email: 'creator@lumora.test',
    role: 'creator',
    is_active: true,
    created_at: '2026-08-01T09:15:00Z',
  },
  {
    user_id: 'u-zoya-creator',
    org_id: DEFAULT_ORG.org_id,
    full_name: 'Zoya Khan',
    email: 'creator2@lumora.test',
    role: 'creator',
    is_active: true,
    created_at: '2026-08-01T09:20:00Z',
  },
  {
    user_id: 'u-neil-reviewer',
    org_id: DEFAULT_ORG.org_id,
    full_name: "Neil D'Souza",
    email: 'reviewer@lumora.test',
    role: 'reviewer',
    is_active: true,
    created_at: '2026-08-01T09:25:00Z',
  },
  {
    user_id: 'u-anita-reviewer',
    org_id: DEFAULT_ORG.org_id,
    full_name: 'Anita Joshi',
    email: 'reviewer2@lumora.test',
    role: 'reviewer',
    is_active: true,
    created_at: '2026-08-01T09:30:00Z',
  },
];

const DEFAULT_PROFILE: BrandProfile = {
  profile_id: 'prof-lumora-main',
  org_id: DEFAULT_ORG.org_id,
  name: 'Lumora Fitness',
  voice_notes:
    'Calm, encouraging, and evidence-grounded. We celebrate sustainable progress over quick fixes. Avoid aggressive urgency, hype superlatives, and shouty all-caps.',
  external_ai_allowed: true,
  team_visibility: 'team',
  status: 'active',
  created_at: '2026-08-01T10:00:00Z',
};

export const SEED_GUIDELINES: BrandGuideline[] = [
  {
    guideline_id: 'g-01',
    profile_id: DEFAULT_PROFILE.profile_id,
    code: 'G-01',
    title: 'Brand Name Spelling & Capitalization',
    category: 'terminology',
    rule_text: 'Always spell "Lumora Fitness" with a capital L and F. The short form "Lumora" is acceptable in headlines after first mention.',
    content_types: [],
    example_good: 'Join Lumora Fitness for balanced daily movement.',
    example_bad: 'lumora fitness is great.',
    version: 1,
    is_active: true,
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    guideline_id: 'g-02',
    profile_id: DEFAULT_PROFILE.profile_id,
    code: 'G-02',
    title: 'Tier Plan Naming',
    category: 'terminology',
    rule_text: 'Refer to plans as "Lumora Free" and "Lumora Pro". Never use "Basic", "Starter", "Gold", or "Enterprise".',
    content_types: [],
    example_good: 'Upgrade to Lumora Pro for personalized plans.',
    example_bad: 'Upgrade to our Gold Plan.',
    version: 1,
    is_active: true,
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    guideline_id: 'g-03',
    profile_id: DEFAULT_PROFILE.profile_id,
    code: 'G-03',
    title: 'Audience Addressing',
    category: 'tone',
    rule_text: 'Address the audience as "members" or "athletes". Avoid impersonal corporate terms like "users" or "customers".',
    content_types: [],
    example_good: 'Welcoming all new members to the challenge.',
    example_bad: 'Our customers love our app.',
    version: 1,
    is_active: true,
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    guideline_id: 'g-04',
    profile_id: DEFAULT_PROFILE.profile_id,
    code: 'G-04',
    title: 'Workout Duration Format',
    category: 'general',
    rule_text: 'Always write workout lengths in format "XX min" or "XX minutes", e.g. "20 min strength session".',
    content_types: [],
    example_good: 'A quick 15 min mobility routine.',
    example_bad: 'A 1/4 hour session.',
    version: 1,
    is_active: true,
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    guideline_id: 'g-05',
    profile_id: DEFAULT_PROFILE.profile_id,
    code: 'G-05',
    title: 'Caloric & Weight Loss Claims',
    category: 'claims',
    rule_text: 'Never promise specific calorie burn numbers or guaranteed weight loss amounts (e.g. "burn 500 kcal guaranteed").',
    content_types: [],
    example_good: 'High-energy cardio session designed to build stamina.',
    example_bad: 'Burn 600 calories in 20 minutes guaranteed!',
    version: 1,
    is_active: true,
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    guideline_id: 'g-06',
    profile_id: DEFAULT_PROFILE.profile_id,
    code: 'G-06',
    title: 'Primary Brand Color Usage',
    category: 'visual',
    rule_text: 'Primary brand accent is Loom Teal (#139A93). Do not alter the tint or use neon green substitutes.',
    content_types: [],
    version: 1,
    is_active: true,
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    guideline_id: 'g-07',
    profile_id: DEFAULT_PROFILE.profile_id,
    code: 'G-07',
    title: 'Exclamation & Punctuation Discipline',
    category: 'tone',
    rule_text: 'Avoid repeated exclamation marks ("!!", "!!!"). Use at most one exclamation mark per paragraph to maintain a calm, confident voice.',
    content_types: [],
    example_good: 'Start your routine today!',
    example_bad: 'Transform your body right now!!!!!!',
    version: 1,
    is_active: true,
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    guideline_id: 'g-08',
    profile_id: DEFAULT_PROFILE.profile_id,
    code: 'G-08',
    title: 'Urgency & Pressure Phrasing',
    category: 'tone',
    rule_text: 'Do not use fear-of-missing-out phrases like "Don\'t be a loser", "Hurry before you fail", or "Last chance ever".',
    content_types: ['social_post', 'ad_copy', 'email'],
    example_good: 'Join us when you are ready to build consistency.',
    example_bad: 'Join NOW or stay out of shape forever!',
    version: 1,
    is_active: true,
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    guideline_id: 'g-09',
    profile_id: DEFAULT_PROFILE.profile_id,
    code: 'G-09',
    title: 'Health Outcome Timeframe Promises',
    category: 'claims',
    rule_text: 'Never state specific speed-of-outcome results such as "results in two weeks", "cure", or "eliminate joint pain".',
    content_types: [],
    example_good: 'Supports steady, progressive joint mobility over time.',
    example_bad: 'Cures back pain in just two weeks guaranteed.',
    version: 1,
    is_active: true,
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    guideline_id: 'g-10',
    profile_id: DEFAULT_PROFILE.profile_id,
    code: 'G-10',
    title: 'Mandatory Descriptive Alt Text',
    category: 'accessibility',
    rule_text: 'Every submitted image must include descriptive alt text describing the action or subject for screen reader users.',
    content_types: [],
    version: 1,
    is_active: true,
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    guideline_id: 'g-11',
    profile_id: DEFAULT_PROFILE.profile_id,
    code: 'G-11',
    title: 'Descriptive Link Text',
    category: 'accessibility',
    rule_text: 'Link text must clearly describe destination or action. Avoid generic "click here", "read more", "here", or "link".',
    content_types: [],
    example_good: 'Explore all Lumora Pro workout plans.',
    example_bad: 'To see plans, click here.',
    version: 1,
    is_active: true,
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    guideline_id: 'g-12',
    profile_id: DEFAULT_PROFILE.profile_id,
    code: 'G-12',
    title: 'Currency Presentation',
    category: 'general',
    rule_text: 'Price figures for Indian market should state "₹499/month" or "499 rupees a month".',
    content_types: [],
    version: 1,
    is_active: true,
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    guideline_id: 'g-13',
    profile_id: DEFAULT_PROFILE.profile_id,
    code: 'G-13',
    title: 'Trainer Attribution',
    category: 'general',
    rule_text: 'Always cite certified trainer names with their specialty, e.g. "Coach Priya, Strength & Conditioning".',
    content_types: ['social_post', 'blog'],
    version: 1,
    is_active: true,
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    guideline_id: 'g-14',
    profile_id: DEFAULT_PROFILE.profile_id,
    code: 'G-14',
    title: 'Music Licensing Disclaimer',
    category: 'general',
    rule_text: 'Workouts featuring commercial tracks must include "All playlist tracks licensed through Lumora Sound Partners".',
    content_types: ['social_post', 'ad_copy'],
    version: 1,
    is_active: true,
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    guideline_id: 'g-15',
    profile_id: DEFAULT_PROFILE.profile_id,
    code: 'G-15',
    title: 'Comparative & Ranking Claims Substantiation',
    category: 'claims',
    rule_text: 'Comparative claims like "number one rated", "best fitness app", or "#1" require an approved, cited external fact reference.',
    content_types: [],
    example_good: 'Rated 4.8 stars by over 10,000 members.',
    example_bad: 'The number one rated fitness app on the planet!',
    version: 1,
    is_active: true,
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    guideline_id: 'g-16',
    profile_id: DEFAULT_PROFILE.profile_id,
    code: 'G-16',
    title: 'Dietary & Nutrition Advice Boundaries',
    category: 'claims',
    rule_text: 'Only certified nutritionists may publish meal plans. Content must state "Consult a registered dietitian before changing diets."',
    content_types: ['blog', 'email'],
    version: 1,
    is_active: true,
    created_at: '2026-08-01T10:00:00Z',
  },
];

export const SEED_FACTS: ApprovedFact[] = [
  {
    fact_id: 'f-01',
    profile_id: DEFAULT_PROFILE.profile_id,
    code: 'F-01',
    subject: 'Foundation Date & Headquarters',
    statement: 'Lumora Fitness was founded in 2022 and is headquartered in Bengaluru, Karnataka, India.',
    source_ref: 'Lumora Corporate Registry 2022',
    valid_until: '2030-12-31',
    is_active: true,
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    fact_id: 'f-02',
    profile_id: DEFAULT_PROFILE.profile_id,
    code: 'F-02',
    subject: 'Active Member Base',
    statement: 'As of Q2 2026, Lumora has over 250,000 active monthly workout members across India.',
    source_ref: 'Q2 2026 Metrics Report',
    valid_until: '2026-12-31',
    is_active: true,
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    fact_id: 'f-03',
    profile_id: DEFAULT_PROFILE.profile_id,
    code: 'F-03',
    subject: 'Lumora Free Entitlements',
    statement: 'Lumora Free includes 5 GB of storage and 3 saved plans at zero cost.',
    source_ref: 'Product Spec Sheet v3.1',
    valid_until: '2028-12-31',
    is_active: true,
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    fact_id: 'f-04',
    profile_id: DEFAULT_PROFILE.profile_id,
    code: 'F-04',
    subject: 'App Store Rating',
    statement: 'Lumora Fitness holds a 4.8 out of 5-star rating on the Google Play Store based on 15,000+ reviews.',
    source_ref: 'Google Play Store July 2026',
    valid_until: '2026-12-31',
    is_active: true,
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    fact_id: 'f-05',
    profile_id: DEFAULT_PROFILE.profile_id,
    code: 'F-05',
    subject: 'Class Library Size',
    statement: 'The Lumora workout library contains over 1,200 on-demand sessions across yoga, HIIT, and strength.',
    source_ref: 'Content Catalog July 2026',
    valid_until: '2027-06-30',
    is_active: true,
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    fact_id: 'f-06',
    profile_id: DEFAULT_PROFILE.profile_id,
    code: 'F-06',
    subject: 'Wearable Sync Integration',
    statement: 'Lumora syncs directly with Apple Health, Google Health Connect, and Garmin wearables.',
    source_ref: 'Tech Architecture Spec v2.0',
    valid_until: '2029-12-31',
    is_active: true,
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    fact_id: 'f-07',
    profile_id: DEFAULT_PROFILE.profile_id,
    code: 'F-07',
    subject: 'Pro Free Trial Policy',
    statement: 'Lumora Pro offers a 14-day free trial. Payment card details are required upon registration.',
    source_ref: 'Subscription Policy Document 2026',
    valid_until: '2028-12-31',
    is_active: true,
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    fact_id: 'f-08',
    profile_id: DEFAULT_PROFILE.profile_id,
    code: 'F-08',
    subject: 'Live Coach Sessions',
    statement: 'Lumora Pro members can book up to 2 live group coaching sessions each calendar month.',
    source_ref: 'Pro Entitlements Schedule',
    valid_until: '2027-12-31',
    is_active: true,
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    fact_id: 'f-09',
    profile_id: DEFAULT_PROFILE.profile_id,
    code: 'F-09',
    subject: 'Monthly Pricing',
    statement: 'Lumora Pro monthly membership is priced at ₹499 (499 rupees a month) including all applicable taxes.',
    source_ref: 'Finance & Pricing Schedule Q1 2026',
    valid_until: '2027-03-31',
    is_active: true,
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    fact_id: 'f-10',
    profile_id: DEFAULT_PROFILE.profile_id,
    code: 'F-10',
    subject: 'Annual Pricing & Savings',
    statement: 'Lumora Pro annual membership costs ₹4,788 per year, offering a 20% discount compared to monthly billing.',
    source_ref: 'Finance & Pricing Schedule Q1 2026',
    valid_until: '2027-03-31',
    is_active: true,
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    fact_id: 'f-11',
    profile_id: DEFAULT_PROFILE.profile_id,
    code: 'F-11',
    subject: 'Language Availability',
    statement: 'Audio instruction is available in English, Hindi, and Kannada.',
    source_ref: 'Localization Manifest v1.4',
    valid_until: '2028-12-31',
    is_active: true,
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    fact_id: 'f-12',
    profile_id: DEFAULT_PROFILE.profile_id,
    code: 'F-12',
    subject: 'Storage Allocation',
    statement: 'Lumora Pro includes 50 GB of workout-video storage for custom offline routines.',
    source_ref: 'Infrastructure Cloud Allocation 2026',
    valid_until: '2028-12-31',
    is_active: true,
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    fact_id: 'f-13',
    profile_id: DEFAULT_PROFILE.profile_id,
    code: 'F-13',
    subject: 'Cancellation Window',
    statement: 'Members may cancel Pro subscriptions anytime within the app without cancellation fees.',
    source_ref: 'Terms of Service §4.2',
    valid_until: '2029-12-31',
    is_active: true,
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    fact_id: 'f-14',
    profile_id: DEFAULT_PROFILE.profile_id,
    code: 'F-14',
    subject: 'Equipment-Free Routines',
    statement: 'Over 60% of workouts in the Lumora library require zero gym equipment.',
    source_ref: 'Curriculum Audit June 2026',
    valid_until: '2027-06-30',
    is_active: true,
    created_at: '2026-08-01T10:00:00Z',
  },
];

export const SEED_TERMS: TerminologyItem[] = [
  {
    term_id: 't-01',
    profile_id: DEFAULT_PROFILE.profile_id,
    code: 'T-01',
    preferred_term: 'members',
    avoid_terms: ['customers', 'users', 'clients', 'subscribers'],
    notes: 'Maintain community identity; Lumora athletes belong to a shared movement.',
    case_sensitive: false,
  },
  {
    term_id: 't-02',
    profile_id: DEFAULT_PROFILE.profile_id,
    code: 'T-02',
    preferred_term: 'workout routine',
    avoid_terms: ['grind session', 'torture session', 'punishment workout'],
    notes: 'Voice is encouraging, never punitive.',
    case_sensitive: false,
  },
  {
    term_id: 't-03',
    profile_id: DEFAULT_PROFILE.profile_id,
    code: 'T-03',
    preferred_term: 'sustainable progress',
    avoid_terms: ['quick fix', 'miracle body', 'instant transformation'],
    notes: 'Promote long-term well-being over false promises.',
    case_sensitive: false,
  },
  {
    term_id: 't-04',
    profile_id: DEFAULT_PROFILE.profile_id,
    code: 'T-04',
    preferred_term: 'movement coach',
    avoid_terms: ['drill sergeant', 'boss', 'instructor'],
    notes: 'Warm, supportive coaching terminology.',
    case_sensitive: false,
  },
  {
    term_id: 't-05',
    profile_id: DEFAULT_PROFILE.profile_id,
    code: 'T-05',
    preferred_term: 'Lumora Pro',
    avoid_terms: ['Pro Tier', 'Premium Plan', 'Gold Subscription'],
    notes: 'Exact naming standard G-02.',
    case_sensitive: true,
  },
  {
    term_id: 't-06',
    profile_id: DEFAULT_PROFILE.profile_id,
    code: 'T-06',
    preferred_term: 'Lumora Free',
    avoid_terms: ['Free Tier', 'Basic Plan', 'Starter Tier'],
    notes: 'Exact naming standard G-02.',
    case_sensitive: true,
  },
  {
    term_id: 't-07',
    profile_id: DEFAULT_PROFILE.profile_id,
    code: 'T-07',
    preferred_term: 'accessible',
    avoid_terms: ['cheap', 'low cost', 'bargain-basement'],
    notes: 'Reflects premium value at attainable pricing.',
    case_sensitive: false,
  },
  {
    term_id: 't-08',
    profile_id: DEFAULT_PROFILE.profile_id,
    code: 'T-08',
    preferred_term: 'recovery day',
    avoid_terms: ['lazy day', 'off day', 'cheat day'],
    notes: 'Rest is an active, respected part of athletic development.',
    case_sensitive: false,
  },
];

export const SEED_ASSETS: BrandAsset[] = [
  {
    asset_id: 'ast-01',
    profile_id: DEFAULT_PROFILE.profile_id,
    name: 'Lumora Master Logo (Teal on White)',
    asset_type: 'logo',
    file_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&fit=crop&q=80',
    alt_text: 'Lumora Fitness brand mark with abstract running loom spiral in teal',
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    asset_id: 'ast-02',
    profile_id: DEFAULT_PROFILE.profile_id,
    name: 'Lumora App Hero Showcase Banner',
    asset_type: 'image',
    file_url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&auto=format&fit=crop&q=80',
    alt_text: 'Athletes participating in morning mobility training outdoors',
    created_at: '2026-08-01T10:00:00Z',
  },
];

export const SEED_SOCIAL_ACCOUNTS: SocialAccount[] = [
  {
    account_id: 'soc-li-01',
    provider: 'linkedin',
    external_account_id: 'urn:li:organization:984210',
    display_name: 'Lumora Fitness Official',
    account_handle: '@lumora-fitness',
    account_type: 'organization',
    granted_scopes: ['w_organization_social', 'r_organization_social', 'rw_organization_admin'],
    status: 'connected',
    profile_picture_url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=120&auto=format&fit=crop&q=80',
    last_verified_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    owner_id: 'u-admin-01',
    created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
  },
  {
    account_id: 'soc-fb-02',
    provider: 'meta_facebook',
    external_account_id: 'page_1092837465',
    display_name: 'Lumora Fitness Global',
    account_handle: '@LumoraFitnessHQ',
    account_type: 'page',
    granted_scopes: ['pages_manage_posts', 'pages_read_engagement', 'publish_video'],
    status: 'connected',
    profile_picture_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=120&auto=format&fit=crop&q=80',
    last_verified_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    owner_id: 'u-admin-01',
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    account_id: 'soc-ig-03',
    provider: 'meta_instagram',
    external_account_id: 'ig_pro_17841400',
    display_name: 'Lumora Fitness Active',
    account_handle: '@lumorafit',
    account_type: 'professional',
    granted_scopes: ['instagram_basic', 'instagram_content_publish', 'instagram_manage_insights'],
    status: 'connected',
    profile_picture_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=120&auto=format&fit=crop&q=80',
    last_verified_at: new Date(Date.now() - 3600000 * 1).toISOString(),
    owner_id: 'u-admin-01',
    created_at: new Date(Date.now() - 86400000 * 21).toISOString(),
  },
  {
    account_id: 'soc-tw-04',
    provider: 'x_twitter',
    external_account_id: 'tw_901928374',
    display_name: 'Lumora Updates',
    account_handle: '@LumoraHQ',
    account_type: 'member',
    granted_scopes: ['tweet.read', 'tweet.write', 'users.read'],
    status: 'disconnected',
    last_verified_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    owner_id: 'u-admin-01',
    created_at: new Date(Date.now() - 86400000 * 45).toISOString(),
  },
];

export const SEED_PUBLISH_JOBS: PublishJob[] = [
  {
    job_id: 'pub-job-101',
    variant_id: 'var-101',
    account_id: 'soc-li-01',
    submission_id: 'sub-lumora-1015',
    submission_title: 'Summer Movement Program Launch Announcement',
    provider: 'linkedin',
    caption: 'Discover the science of mindful endurance. Lumora Pro members now get access to our guided 14-day movement sequences. #MovementHealth #FitnessJourney',
    media_urls: ['https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80'],
    scheduled_time: new Date(Date.now() - 86400000 * 2).toISOString(),
    timezone: 'UTC',
    status: 'published',
    retry_count: 0,
    idempotency_key: 'idem-101-linkedin',
    created_by: 'u-creator-01',
    created_by_name: 'Ishaan Verma',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    executed_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    job_id: 'pub-job-102',
    variant_id: 'var-102',
    account_id: 'soc-ig-03',
    submission_id: 'sub-lumora-1015',
    submission_title: 'Summer Movement Program Launch Announcement',
    provider: 'meta_instagram',
    caption: 'Progress over perfection. Every routine is built for long-term strength. Link in bio to join today. #LumoraFitness #DailyMovement',
    media_urls: ['https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=80'],
    scheduled_time: new Date(Date.now() + 86400000 * 1).toISOString(),
    timezone: 'Asia/Kolkata',
    status: 'scheduled',
    retry_count: 0,
    idempotency_key: 'idem-102-instagram',
    created_by: 'u-creator-01',
    created_by_name: 'Ishaan Verma',
    created_at: new Date().toISOString(),
  },
];

export const SEED_PUBLISH_RESULTS: PublishResult[] = [
  {
    result_id: 'res-101',
    job_id: 'pub-job-101',
    provider: 'linkedin',
    provider_post_id: 'urn:li:share:71829304910293847',
    provider_url: 'https://www.linkedin.com/feed/update/urn:li:share:71829304910293847',
    published_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: 'success',
    response_metadata: { httpStatus: 201, organizationUrn: 'urn:li:organization:984210' },
  },
];

export const LABELLED_TEST_SET: LabelledTestCase[] = [
  {
    id: 'TS-01',
    draft_text:
      'Lumora Pro gives all customers unlimited cloud storage and is the number one rated fitness app!!!',
    media: [{ name: 'banner.png', alt_text: null }],
    expected_findings: [
      { category: 'fact_conflict', severity: 'high', evidence_code: 'F-12', status: 'verified_conflict' },
      { category: 'unsupported_claim', severity: 'medium', evidence_code: 'G-15', status: 'needs_human_check' },
      { category: 'tone', severity: 'low', evidence_code: 'G-07', status: 'rule_violation' },
      { category: 'terminology', severity: 'low', evidence_code: 'T-01', status: 'rule_violation' },
      { category: 'accessibility', severity: 'medium', evidence_code: 'G-10', status: 'rule_violation' },
    ],
    notes: 'Reference end-to-end test case from Part F.1',
  },
  {
    id: 'TS-02',
    draft_text:
      'Lumora Free includes 5 GB of storage and 3 saved plans. Join over 250,000 active members today!',
    expected_findings: [],
    notes: 'Clean compliant draft citing verified facts F-02 and F-03 without violations',
  },
  {
    id: 'TS-03',
    draft_text:
      'Try our Gold Plan today for 299 rupees a month with a 30 days trial, no card needed!',
    expected_findings: [
      { category: 'terminology', severity: 'low', evidence_code: 'G-02', status: 'rule_violation' },
      { category: 'fact_conflict', severity: 'high', evidence_code: 'F-09', status: 'verified_conflict' },
      { category: 'fact_conflict', severity: 'high', evidence_code: 'F-07', status: 'verified_conflict' },
    ],
    notes: 'Pricing conflict (299 vs 499) and trial conflict (30 days no card vs 14 days card required)',
  },
  {
    id: 'TS-04',
    draft_text:
      'Hurry before you fail! Join NOW or stay out of shape forever!!!!!!',
    expected_findings: [
      { category: 'tone', severity: 'low', evidence_code: 'G-08', status: 'rule_violation' },
      { category: 'tone', severity: 'low', evidence_code: 'G-07', status: 'rule_violation' },
    ],
    notes: 'Aggressive urgency breach and excessive exclamation mark run',
  },
  {
    id: 'TS-05',
    draft_text:
      'Our movement program guarantees results in two weeks and eliminates joint pain.',
    expected_findings: [
      { category: 'unsupported_claim', severity: 'medium', evidence_code: 'G-09', status: 'rule_violation' },
    ],
    notes: 'Speed-of-outcome health and pain elimination claims',
  },
  {
    id: 'TS-06',
    draft_text:
      'To view all our accessible training plans, click here.',
    expected_findings: [
      { category: 'accessibility', severity: 'low', evidence_code: 'G-11', status: 'rule_violation' },
    ],
    notes: 'Vague link text "click here" violating G-11',
  },
  {
    id: 'TS-07',
    draft_text:
      'All clients get access to our cheap subscriptions and drill sergeant trainers.',
    expected_findings: [
      { category: 'terminology', severity: 'low', evidence_code: 'T-01', status: 'rule_violation' },
      { category: 'terminology', severity: 'low', evidence_code: 'T-07', status: 'rule_violation' },
      { category: 'terminology', severity: 'low', evidence_code: 'T-04', status: 'rule_violation' },
    ],
    notes: 'Triple terminology violations (clients -> members, cheap -> accessible, drill sergeant -> movement coach)',
  },
  {
    id: 'TS-08',
    draft_text:
      'Lumora Pro gives all members 50 GB of workout-video storage for offline routines!',
    expected_findings: [],
    notes: 'Fully corrected reference revision passing 100% clean',
  },
];

class ReactiveStore {
  organisations: Organisation[] = [DEFAULT_ORG];
  users: User[] = [...SEED_USERS];
  profiles: BrandProfile[] = [DEFAULT_PROFILE];
  guidelines: BrandGuideline[] = [...SEED_GUIDELINES];
  facts: ApprovedFact[] = [...SEED_FACTS];
  terms: TerminologyItem[] = [...SEED_TERMS];
  assets: BrandAsset[] = [...SEED_ASSETS];
  submissions: ContentSubmission[] = [];
  versions: ContentVersion[] = [];
  reports: AnalysisReport[] = [];
  comments: ReviewComment[] = [];
  approvals: ApprovalRecord[] = [];
  auditLogs: AuditLog[] = [];
  socialAccounts: SocialAccount[] = [...SEED_SOCIAL_ACCOUNTS];
  socialVariants: SocialPostVariant[] = [];
  publishJobs: PublishJob[] = [...SEED_PUBLISH_JOBS];
  publishResults: PublishResult[] = [...SEED_PUBLISH_RESULTS];

  constructor() {
    this.initHistoricalData();
    this.loadFromStorage();
  }

  private initHistoricalData() {
    // 25 historical submissions across 90 days for realistic analytics
    const pastDays = [
      88, 85, 80, 75, 72, 68, 64, 60, 56, 52, 48, 44, 40, 36, 32, 28, 25, 21, 18, 14, 10, 7, 5, 2, 0,
    ];

    const types: any[] = ['email', 'social_post', 'blog', 'ad_copy', 'landing_page'];
    const statuses: any[] = [
      'approved', 'approved', 'approved', 'approved', 'approved',
      'changes_requested', 'approved', 'approved', 'approved', 'approved',
      'in_review', 'approved', 'approved', 'in_correction', 'approved',
      'approved', 'changes_requested', 'approved', 'approved', 'in_review',
      'draft', 'approved', 'in_review', 'in_correction', 'in_correction'
    ];

    pastDays.forEach((daysAgo, i) => {
      const subId = `sub-lumora-${1000 + i}`;
      const verId = `ver-${subId}-v1`;
      const date = new Date(Date.now() - daysAgo * 24 * 3600 * 1000).toISOString();
      const status = statuses[i % statuses.length];
      const creator = i % 2 === 0 ? SEED_USERS[1] : SEED_USERS[2];

      this.submissions.push({
        submission_id: subId,
        profile_id: DEFAULT_PROFILE.profile_id,
        creator_id: creator.user_id,
        creator_name: creator.full_name,
        title: `Campaign Asset #${i + 1} (${types[i % types.length]})`,
        content_type: types[i % types.length],
        status,
        created_at: date,
        updated_at: date,
      });

      this.versions.push({
        version_id: verId,
        submission_id: subId,
        version_no: 1,
        body_text: `Welcome all members to Lumora Fitness. Our routine helps build consistent daily health.`,
        media: [],
        links: [],
        source: 'creator_submit',
        created_by: creator.user_id,
        created_by_name: creator.full_name,
        created_at: date,
      });

      // Sample reports
      this.reports.push({
        report_id: `rep-${verId}`,
        version_id: verId,
        summary: {
          high: i % 4 === 0 ? 1 : 0,
          medium: i % 3 === 0 ? 1 : 0,
          low: i % 2 === 0 ? 1 : 0,
          total: (i % 4 === 0 ? 1 : 0) + (i % 3 === 0 ? 1 : 0) + (i % 2 === 0 ? 1 : 0),
        },
        model_name: 'gemini-3.8-flash',
        ai_status: 'completed',
        created_at: date,
        issues: [],
      });
    });
  }

  loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('inkloom_store_v1');
      if (raw) {
        const data = JSON.parse(raw);
        if (data.submissions) this.submissions = data.submissions;
        if (data.versions) this.versions = data.versions;
        if (data.reports) this.reports = data.reports;
        if (data.guidelines) this.guidelines = data.guidelines;
        if (data.facts) this.facts = data.facts;
        if (data.terms) this.terms = data.terms;
        if (data.assets) this.assets = data.assets;
        if (data.comments) this.comments = data.comments;
        if (data.approvals) this.approvals = data.approvals;
        if (data.auditLogs) this.auditLogs = data.auditLogs;
        if (data.socialAccounts) this.socialAccounts = data.socialAccounts;
        if (data.socialVariants) this.socialVariants = data.socialVariants;
        if (data.publishJobs) this.publishJobs = data.publishJobs;
        if (data.publishResults) this.publishResults = data.publishResults;
      }
    } catch (_) {}
  }

  persist() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(
        'inkloom_store_v1',
        JSON.stringify({
          submissions: this.submissions,
          versions: this.versions,
          reports: this.reports,
          guidelines: this.guidelines,
          facts: this.facts,
          terms: this.terms,
          assets: this.assets,
          comments: this.comments,
          approvals: this.approvals,
          auditLogs: this.auditLogs,
          socialAccounts: this.socialAccounts,
          socialVariants: this.socialVariants,
          publishJobs: this.publishJobs,
          publishResults: this.publishResults,
        })
      );
    } catch (_) {}
  }

  resetToSeed() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('inkloom_store_v1');
    }
    this.guidelines = [...SEED_GUIDELINES];
    this.facts = [...SEED_FACTS];
    this.terms = [...SEED_TERMS];
    this.assets = [...SEED_ASSETS];
    this.socialAccounts = [...SEED_SOCIAL_ACCOUNTS];
    this.publishJobs = [...SEED_PUBLISH_JOBS];
    this.publishResults = [...SEED_PUBLISH_RESULTS];
    this.socialVariants = [];
    this.submissions = [];
    this.versions = [];
    this.reports = [];
    this.comments = [];
    this.approvals = [];
    this.auditLogs = [];
    this.initHistoricalData();
    this.persist();
  }

  getSubmissionById(id: string) {
    return this.submissions.find((s) => s.submission_id === id);
  }

  getVersionsBySubmissionId(subId: string) {
    return this.versions.filter((v) => v.submission_id === subId).sort((a, b) => a.version_no - b.version_no);
  }

  getLatestVersion(subId: string) {
    const list = this.getVersionsBySubmissionId(subId);
    return list[list.length - 1] || null;
  }

  getReportByVersionId(verId: string) {
    return this.reports.find((r) => r.version_id === verId) || null;
  }

  getCommentsByVersionId(verId: string) {
    return this.comments.filter((c) => c.version_id === verId);
  }

  getCommentsBySubmissionId(subId: string) {
    const versionIds = this.getVersionsBySubmissionId(subId).map((v) => v.version_id);
    return this.comments.filter((c) => versionIds.includes(c.version_id));
  }

  addComment(comment: ReviewComment) {
    this.comments.push(comment);
    this.persist();
    return comment;
  }

  getAuditLogs() {
    return [...this.auditLogs].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  // --- Social Media Publishing Methods ---
  getSocialAccounts() {
    return this.socialAccounts;
  }

  getSocialAccountById(id: string) {
    return this.socialAccounts.find((a) => a.account_id === id);
  }

  connectSocialAccount(account: SocialAccount) {
    const existingIdx = this.socialAccounts.findIndex((a) => a.account_id === account.account_id);
    if (existingIdx >= 0) {
      this.socialAccounts[existingIdx] = account;
    } else {
      this.socialAccounts.push(account);
    }
    this.auditLogs.unshift({
      log_id: Date.now(),
      org_id: DEFAULT_ORG.org_id,
      actor_id: account.owner_id,
      actor_name: 'Authorized Admin',
      action: 'social_account_connected',
      entity_type: 'social_account',
      entity_id: account.account_id,
      metadata: { provider: account.provider, name: account.display_name },
      created_at: new Date().toISOString(),
    });
    this.persist();
    return account;
  }

  disconnectSocialAccount(id: string) {
    const target = this.socialAccounts.find((a) => a.account_id === id);
    if (target) {
      target.status = 'disconnected';
      this.auditLogs.unshift({
        log_id: Date.now(),
        org_id: DEFAULT_ORG.org_id,
        actor_id: 'u-admin-01',
        actor_name: 'Authorized Admin',
        action: 'social_account_disconnected',
        entity_type: 'social_account',
        entity_id: id,
        metadata: { provider: target.provider, name: target.display_name },
        created_at: new Date().toISOString(),
      });
      this.persist();
    }
    return target;
  }

  getVariantsBySubmissionId(subId: string) {
    return this.socialVariants.filter((v) => v.submission_id === subId);
  }

  getVariantById(variantId: string) {
    return this.socialVariants.find((v) => v.variant_id === variantId);
  }

  saveSocialVariant(variant: SocialPostVariant) {
    const idx = this.socialVariants.findIndex((v) => v.variant_id === variant.variant_id);
    if (idx >= 0) {
      this.socialVariants[idx] = variant;
    } else {
      this.socialVariants.push(variant);
    }
    this.persist();
    return variant;
  }

  getPublishJobs() {
    return [...this.publishJobs].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  getPublishJobById(jobId: string) {
    return this.publishJobs.find((j) => j.job_id === jobId);
  }

  createPublishJob(job: PublishJob) {
    this.publishJobs.unshift(job);
    this.auditLogs.unshift({
      log_id: Date.now(),
      org_id: DEFAULT_ORG.org_id,
      actor_id: job.created_by,
      actor_name: job.created_by_name,
      action: job.status === 'published' ? 'social_published' : 'social_scheduled',
      entity_type: 'publish_job',
      entity_id: job.job_id,
      metadata: {
        provider: job.provider,
        scheduled_time: job.scheduled_time,
        submission_id: job.submission_id,
      },
      created_at: new Date().toISOString(),
    });
    this.persist();
    return job;
  }

  updatePublishJobStatus(jobId: string, status: PublishJobStatus, error?: string) {
    const target = this.publishJobs.find((j) => j.job_id === jobId);
    if (target) {
      target.status = status;
      if (error) target.last_error = error;
      if (status === 'published') target.executed_at = new Date().toISOString();
      this.persist();
    }
    return target;
  }

  getPublishResults() {
    return [...this.publishResults].sort(
      (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    );
  }

  recordPublishResult(result: PublishResult) {
    this.publishResults.unshift(result);
    this.persist();
    return result;
  }
}

export const store = new ReactiveStore();
