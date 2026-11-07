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

app.get('/api/health', (req, res) => {
  res.json({
    data: {
      status: 'ok',
      db: 'in-memory-relational',
      aiService: process.env.GEMINI_API_KEY ? 'gemini-3.8-flash' : 'gemini-3.8-flash-reference-pipeline',
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    },
  });
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
