/**
 * INKLOOM AI - Full-Stack Express Server
 * Mounts the REST API contract and serves the React SPA on port 3000.
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { store, LABELLED_TEST_SET } from './src/services/store.ts';
import { runAnalysisPipeline } from './src/services/aiPipeline.ts';
import { transition } from './src/services/statusMachine.ts';
import { buildSuggestedRevision, computeWordDiff } from './src/services/revisionBuilder.ts';
import { supabaseService } from './src/services/supabase.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Auth context helper
function getAuthContext(req: Request) {
  const authHeader = req.headers.authorization;
  let user = store.users[1]; // default to Ishaan Verma (creator)

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '').trim();
    const foundUser = store.users.find(
      (u) => u.user_id === token || u.email.toLowerCase() === token.toLowerCase() || u.role === token
    );
    if (foundUser) user = foundUser;
  }

  const demoUserHeader = req.headers['x-demo-user'] as string;
  if (demoUserHeader) {
    const found = store.users.find(
      (u) => u.user_id === demoUserHeader || u.email === demoUserHeader || u.role === demoUserHeader
    );
    if (found) user = found;
  }

  return { user, orgId: user.org_id, role: user.role };
}

// -------------------------------------------------------------
// REST API ROUTES (/api/...)
// -------------------------------------------------------------

app.get('/api/health', async (req, res) => {
  const dbHealth = await supabaseService.checkHealth();
  res.json({
    data: {
      status: 'ok',
      db: 'supabase-postgresql',
      dbHealth,
      aiService: process.env.GEMINI_API_KEY ? 'gemini-3.8-flash' : 'gemini-3.8-flash-reference-pipeline',
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    },
  });
});

app.get('/api/readiness', async (req, res) => {
  const dbHealth = await supabaseService.checkHealth();
  if (dbHealth.connected) {
    res.json({ status: 'ready', database: dbHealth.status, latencyMs: dbHealth.latencyMs });
  } else {
    res.status(503).json({ status: 'degraded', database: 'unreachable', error: dbHealth.error });
  }
});

app.get('/api/db/status', async (req, res) => {
  const dbHealth = await supabaseService.checkHealth();
  res.json({ data: dbHealth });
});

app.post('/api/db/sync', async (req, res) => {
  try {
    const org = store.organisations[0];
    const profile = store.profiles[0];
    const guidelines = store.guidelines;
    const facts = store.facts;
    const terms = store.terms;
    const syncRes = await supabaseService.syncBrandKnowledge(org, profile, guidelines, facts, terms);

    for (const sub of store.submissions.slice(0, 10)) {
      const ver = store.getLatestVersion(sub.submission_id);
      await supabaseService.persistSubmission(sub, ver);
    }

    res.json({ data: { success: true, ...syncRes } });
  } catch (err: any) {
    res.status(500).json({ error: { code: 'SYNC_FAILED', message: err.message } });
  }
});

app.get('/api/users', (req, res) => {
  const { user } = getAuthContext(req);
  const users = store.users.filter((u) => u.org_id === user.org_id);
  res.json({ data: users, meta: { total: users.length } });
});

app.get('/api/brand-profiles', (req, res) => {
  const { user } = getAuthContext(req);
  const profiles = store.profiles.filter((p) => p.org_id === user.org_id);
  res.json({ data: profiles });
});

app.get('/api/brand-profiles/:id/guidelines', (req, res) => {
  const list = store.guidelines.filter((g) => g.profile_id === req.params.id && g.is_active);
  res.json({ data: list, meta: { total: list.length } });
});

app.get('/api/brand-profiles/:id/facts', (req, res) => {
  const list = store.facts.filter((f) => f.profile_id === req.params.id);
  res.json({ data: list, meta: { total: list.length } });
});

app.get('/api/brand-profiles/:id/terms', (req, res) => {
  const list = store.terms.filter((t) => t.profile_id === req.params.id);
  res.json({ data: list, meta: { total: list.length } });
});

app.get('/api/brand-profiles/:id/assets', (req, res) => {
  const list = store.assets.filter((a) => a.profile_id === req.params.id);
  res.json({ data: list });
});

app.get('/api/submissions', (req, res) => {
  const { user } = getAuthContext(req);
  let list = [...store.submissions];
  if (user.role === 'creator' && store.profiles[0].team_visibility !== 'team') {
    list = list.filter((s) => s.creator_id === user.user_id);
  }
  if (req.query.status) list = list.filter((s) => s.status === req.query.status);
  list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  res.json({ data: list, meta: { total: list.length } });
});

app.get('/api/submissions/:id', (req, res) => {
  const sub = store.getSubmissionById(req.params.id);
  if (!sub) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Submission not found' } });
  const latestVer = store.getLatestVersion(sub.submission_id);
  const report = latestVer ? store.getReportByVersionId(latestVer.version_id) : null;
  const approvals = store.approvals.filter((a) =>
    store.versions.some((v) => v.submission_id === sub.submission_id && v.version_id === a.version_id)
  );
  res.json({ data: { submission: sub, currentVersion: latestVer, latestReport: report, approvals } });
});

app.post('/api/submissions/:id/analyse', async (req, res) => {
  const { user } = getAuthContext(req);
  const sub = store.getSubmissionById(req.params.id);
  if (!sub) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Submission not found' } });

  const profile = store.profiles.find((p) => p.profile_id === sub.profile_id) || store.profiles[0];
  const guidelines = store.guidelines.filter((g) => g.profile_id === profile.profile_id && g.is_active);
  const facts = store.facts.filter((f) => f.profile_id === profile.profile_id && f.is_active);
  const terms = store.terms.filter((t) => t.profile_id === profile.profile_id);

  const version = store.getLatestVersion(sub.submission_id);
  if (!version) return res.status(400).json({ error: { code: 'NO_VERSION', message: 'No version to analyse' } });

  const keyOverride = (req.headers['x-gemini-key'] as string) || process.env.GEMINI_API_KEY;

  try {
    const pipelineResult = await runAnalysisPipeline({
      draft: version.body_text,
      contentType: sub.content_type,
      profile,
      guidelines,
      facts,
      terms,
      media: version.media,
      links: version.links,
      geminiApiKey: keyOverride,
    });

    const reportId = `rep-${Date.now()}`;
    const fullReport = {
      report_id: reportId,
      version_id: version.version_id,
      summary: pipelineResult.report.summary,
      model_name: pipelineResult.report.model_name || 'gemini-3.8-flash',
      modelName: pipelineResult.report.model_name || 'gemini-3.8-flash',
      ai_status: pipelineResult.report.ai_status,
      created_at: new Date().toISOString(),
      issues: pipelineResult.report.issues.map((iss, i) => ({
        ...iss,
        report_id: reportId,
        issue_id: `iss-${reportId}-${i + 1}`,
      })),
    };

    store.reports = store.reports.filter((r) => r.version_id !== version.version_id);
    store.reports.unshift(fullReport);
    sub.status = 'in_correction';
    sub.updated_at = new Date().toISOString();
    store.persist();

    res.json({
      data: fullReport,
      meta: { factChecks: pipelineResult.factChecks, retrievedReferences: pipelineResult.retrievedReferences },
    });
  } catch (err: any) {
    res.status(500).json({ error: { code: 'ANALYSIS_FAILED', message: err.message } });
  }
});

app.get('/api/review-queue', async (req, res) => {
  const inReviewSubs = store.submissions.filter((s) => s.status === 'in_review');
  const queue = inReviewSubs.map((sub) => {
    const latestVer = store.getLatestVersion(sub.submission_id);
    const report = latestVer ? store.getReportByVersionId(latestVer.version_id) : null;
    return {
      submission_id: sub.submission_id,
      version_id: latestVer?.version_id,
      version_no: latestVer?.version_no || 1,
      title: sub.title,
      content_type: sub.content_type,
      creator_name: sub.creator_name || 'Creator',
      created_at: sub.created_at,
      updated_at: sub.updated_at,
      unresolved_high: report?.summary.high || 0,
      unresolved_medium: report?.summary.medium || 0,
      unresolved_low: report?.summary.low || 0,
    };
  }).sort((a, b) => {
    if (b.unresolved_high !== a.unresolved_high) return b.unresolved_high - a.unresolved_high;
    return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
  });
  res.json({ data: queue, meta: { total: queue.length } });
});

// Benchmark eval route
app.post('/api/eval', async (req, res) => {
  const results = [];
  const profile = store.profiles[0];
  const guidelines = store.guidelines.filter((g) => g.is_active);
  const facts = store.facts.filter((f) => f.is_active);
  const terms = store.terms;

  for (const testCase of LABELLED_TEST_SET) {
    const output = await runAnalysisPipeline({
      draft: testCase.draft_text,
      contentType: 'email',
      profile,
      guidelines,
      facts,
      terms,
      media: testCase.media,
      forceHeuristic: true,
    });

    const actual = output.report.issues.map((i) => ({
      category: i.category,
      severity: i.severity,
      evidence_code: i.evidence_refs[0],
      status: i.status,
      excerpt: i.excerpt,
    }));

    const passed =
      testCase.expected_findings.length === 0
        ? actual.length === 0
        : testCase.expected_findings.every((exp) =>
            actual.some((act) => act.category === exp.category && act.evidence_code === exp.evidence_code)
          );

    results.push({
      id: testCase.id,
      draft: testCase.draft_text,
      passed,
      expectedCount: testCase.expected_findings.length,
      actualCount: actual.length,
      expected: testCase.expected_findings,
      actual,
      notes: testCase.notes,
    });
  }

  const passedCount = results.filter((r) => r.passed).length;
  res.json({
    data: {
      total: results.length,
      passedCount,
      accuracyRate: Math.round((passedCount / results.length) * 100),
      testCases: results,
    },
  });
});

// -------------------------------------------------------------
// SOCIAL PUBLISHING & BROADCAST ROUTES
// -------------------------------------------------------------

app.get('/api/social/providers', (req, res) => {
  res.json({
    data: [
      {
        provider: 'linkedin',
        name: 'LinkedIn',
        character_limit: 3000,
        allowed_media: ['image/jpeg', 'image/png'],
        features: ['company_page', 'hashtags', 'post_preview'],
      },
      {
        provider: 'meta_facebook',
        name: 'Meta Facebook',
        character_limit: 63206,
        allowed_media: ['image/jpeg', 'image/png'],
        features: ['page_feed', 'link_preview', 'scheduled_posts'],
      },
      {
        provider: 'meta_instagram',
        name: 'Meta Instagram',
        character_limit: 2200,
        allowed_media: ['image/jpeg', 'image/png'],
        features: ['feed_post', 'carousel', 'alt_text'],
      },
      {
        provider: 'x_twitter',
        name: 'X (Twitter)',
        character_limit: 280,
        allowed_media: ['image/jpeg', 'image/png'],
        features: ['short_form', 'thread', 'hashtags'],
      },
    ],
  });
});

app.get('/api/social/accounts', (req, res) => {
  const accounts = store.getSocialAccounts();
  res.json({ data: accounts });
});

app.post('/api/social/accounts/connect', (req, res) => {
  const { user } = getAuthContext(req);
  const { provider, display_name, handle } = req.body;
  const newAccount = store.connectSocialAccount({
    account_id: `acc-${provider}-${Date.now()}`,
    provider,
    external_account_id: `ext_${Date.now()}`,
    display_name: display_name || `${provider} Account`,
    account_handle: handle || `@brand_${provider}`,
    account_type: 'page',
    granted_scopes: ['publish_posts', 'read_insights'],
    status: 'connected',
    last_verified_at: new Date().toISOString(),
    owner_id: user.user_id,
    created_at: new Date().toISOString(),
  });
  res.json({ data: newAccount });
});

app.post('/api/social/accounts/:id/disconnect', (req, res) => {
  const updated = store.disconnectSocialAccount(req.params.id);
  res.json({ data: updated });
});

app.get('/api/social/variants/:submissionId', (req, res) => {
  const variants = store.getVariantsBySubmissionId(req.params.submissionId);
  res.json({ data: variants });
});

app.post('/api/social/variants', (req, res) => {
  const variant = store.saveSocialVariant(req.body);
  res.json({ data: variant });
});

app.get('/api/social/jobs', (req, res) => {
  const jobs = store.getPublishJobs();
  res.json({ data: jobs });
});

app.get('/api/social/results', (req, res) => {
  const results = store.getPublishResults();
  res.json({ data: results });
});

app.post('/api/social/publish', (req, res) => {
  const { user } = getAuthContext(req);
  const { submission_id, variant_id, account_id, provider, caption, media_urls } = req.body;

  const sub = store.getSubmissionById(submission_id);
  if (!sub) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Submission not found' } });
  }

  // PLATFORM GOVERNANCE GUARD: Only approved submissions can be published
  if (sub.status !== 'approved') {
    return res.status(403).json({
      error: {
        code: 'UNAPPROVED_CONTENT_GUARD',
        message: 'Platform governance rule: Only human-approved submissions may be broadcast to social channels.',
      },
    });
  }

  const account = store.getSocialAccountById(account_id);
  const jobId = `job-${Date.now()}`;
  const now = new Date().toISOString();

  const job = {
    job_id: jobId,
    variant_id: variant_id || `var-${Date.now()}`,
    account_id,
    submission_id,
    submission_title: sub.title,
    provider,
    caption,
    media_urls,
    scheduled_time: now,
    timezone: 'UTC',
    status: 'published' as const,
    retry_count: 0,
    idempotency_key: `idem-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    created_by: user.user_id,
    created_by_name: user.full_name,
    created_at: now,
    executed_at: now,
  };

  store.createPublishJob(job);

  const urlMap: Record<string, string> = {
    linkedin: `https://www.linkedin.com/feed/update/urn:li:share:${Date.now()}`,
    meta_facebook: `https://www.facebook.com/lumorafit/posts/${Date.now()}`,
    meta_instagram: `https://www.instagram.com/p/${Math.random().toString(36).slice(2, 9)}`,
    x_twitter: `https://x.com/lumorafit/status/${Date.now()}`,
  };

  const result = {
    result_id: `res-${Date.now()}`,
    job_id: jobId,
    provider,
    provider_post_id: `post_${Date.now()}`,
    provider_url: urlMap[provider] || `https://${provider}.com/posts/${Date.now()}`,
    published_at: now,
    status: 'success' as const,
    response_metadata: {
      httpStatus: 200,
      providerConfirmed: true,
      actor: user.full_name,
      targetAccount: account?.display_name,
    },
  };

  store.recordPublishResult(result);
  res.json({ data: { job, result } });
});

app.post('/api/social/schedule', (req, res) => {
  const { user } = getAuthContext(req);
  const { submission_id, variant_id, account_id, provider, caption, media_urls, scheduled_time, timezone } = req.body;

  const sub = store.getSubmissionById(submission_id);
  if (!sub) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Submission not found' } });
  }

  // PLATFORM GOVERNANCE GUARD
  if (sub.status !== 'approved') {
    return res.status(403).json({
      error: {
        code: 'UNAPPROVED_CONTENT_GUARD',
        message: 'Platform governance rule: Human approval is mandatory before scheduling content for social broadcast.',
      },
    });
  }

  const jobId = `job-${Date.now()}`;
  const now = new Date().toISOString();

  const job = {
    job_id: jobId,
    variant_id: variant_id || `var-${Date.now()}`,
    account_id,
    submission_id,
    submission_title: sub.title,
    provider,
    caption,
    media_urls,
    scheduled_time: scheduled_time || now,
    timezone: timezone || 'UTC',
    status: 'scheduled' as const,
    retry_count: 0,
    idempotency_key: `idem-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    created_by: user.user_id,
    created_by_name: user.full_name,
    created_at: now,
  };

  store.createPublishJob(job);
  res.json({ data: job });
});

app.post('/api/social/jobs/:id/cancel', (req, res) => {
  const job = store.updatePublishJobStatus(req.params.id, 'cancelled');
  res.json({ data: job });
});

app.post('/api/social/jobs/:id/retry', (req, res) => {
  const existing = store.getPublishJobById(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Job not found' } });
  }
  const job = store.updatePublishJobStatus(req.params.id, 'published');
  if (job) {
    job.retry_count = (job.retry_count || 0) + 1;
    store.recordPublishResult({
      result_id: `res-${Date.now()}`,
      job_id: req.params.id,
      provider: job.provider,
      provider_post_id: `post_retry_${Date.now()}`,
      provider_url: `https://${job.provider}.com/posts/${Date.now()}`,
      published_at: new Date().toISOString(),
      status: 'success',
    });
  }
  res.json({ data: job });
});

// -------------------------------------------------------------
// COLLABORATION COMMENTS ROUTES
// -------------------------------------------------------------

app.get('/api/submissions/:id/comments', (req, res) => {
  const comments = store.getCommentsBySubmissionId(req.params.id);
  res.json({ data: comments });
});

app.post('/api/submissions/:id/comments', (req, res) => {
  const { user } = getAuthContext(req);
  const { versionId, body, issueId, parentCommentId } = req.body;
  const comment = {
    comment_id: `comm-${Date.now()}`,
    version_id: versionId,
    author_id: user.user_id,
    author_name: user.full_name,
    author_role: user.role,
    issue_id: issueId,
    parent_comment_id: parentCommentId,
    body,
    created_at: new Date().toISOString(),
  };
  store.addComment(comment);
  res.json({ data: comment });
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`INKLOOM AI server running on port ${PORT}`);
  });
}

if (process.env.NODE_ENV === 'production') {
  startServer();
}
