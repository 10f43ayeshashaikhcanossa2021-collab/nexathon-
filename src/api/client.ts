/**
 * INKLOOM AI - Unified API Client
 * Interfaces with the Express REST API (/api/...) and falls back
 * seamlessly to local store in all browser environments.
 */
const API_BASE = (
  import.meta.env.VITE_API_BASE || ''
).replace(/\/$/, '');

const apiUrl = (path: string) => `${API_BASE}${path}`;
import {
  User,
  BrandProfile,
  BrandGuideline,
  ApprovedFact,
  TerminologyItem,
  BrandAsset,
  ContentSubmission,
  ContentVersion,
  AnalysisReport,
  ReviewComment,
  ApprovalRecord,
  AuditLog,
  FactCheckItem,
  LabelledTestCase,
  SuggestionStatus,
  SocialAccount,
  SocialPostVariant,
  PublishJob,
  PublishResult,
  SocialProvider,
  VisualCheckReport,
  VisualBrandIssue,
  VisualIssueReviewStatus,
  DiffChunk,
} from '../types/inkloom';
import { store, LABELLED_TEST_SET } from '../services/store';
import { supabaseService, SupabaseHealthReport } from '../services/supabase';

class ApiClient {
  private token: string | null = typeof window !== 'undefined' ? sessionStorage.getItem('inkloom_jwt_token') : null;
  private currentUser: User = store.users[1];

  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = sessionStorage.getItem('inkloom_jwt_token');
    }
    return this.token;
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        sessionStorage.setItem('inkloom_jwt_token', token);
      } else {
        sessionStorage.removeItem('inkloom_jwt_token');
      }
    }
  }

  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  }

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(apiUrl('/api/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Invalid email or password');
    }

    const data = await res.json();
    this.setToken(data.token);
    this.setCurrentUser(data.user);
    return data;
  }

  async logout(): Promise<void> {
    try {
      await fetch(apiUrl('/api/auth/logout'), {
        method: 'POST',
        headers: this.getHeaders(),
      });
    } catch (_) {}
    this.setToken(null);
  }

  getCurrentUser(): User {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('inkloom_active_user');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const found = store.users.find((u) => u.user_id === parsed.user_id) || parsed;
          if (found) {
            this.currentUser = found;
            return found;
          }
        } catch (_) {}
      }
    }
    return this.currentUser;
  }

  setCurrentUser(user: User) {
    this.currentUser = user;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('inkloom_active_user', JSON.stringify(user));
    }
  }

  private getHeaders(): HeadersInit {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async getHealth() {
    try {
      const res = await fetch(apiUrl('/api/health'));
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (_) {}
    return {
      status: 'ok',
      db: 'in-memory-relational',
      aiService: 'gemini-3.8-flash',
      hasGeminiKey: false,
    };
  }

  async getAuthMe() {
    const user = this.getCurrentUser();
    const profile = store.profiles[0];
    const guidelines = store.guidelines.filter((g) => g.profile_id === profile.profile_id && g.is_active);
    const facts = store.facts.filter((f) => f.profile_id === profile.profile_id && f.is_active);
    const terms = store.terms.filter((t) => t.profile_id === profile.profile_id);
    const assets = store.assets.filter((a) => a.profile_id === profile.profile_id);

    return {
      user,
      onboarding: {
        hasProfile: true,
        hasGuidelines: guidelines.length >= 3,
        hasFacts: facts.length >= 1,
        hasTerms: terms.length >= 1,
        hasAssets: assets.length >= 1,
        isComplete: guidelines.length >= 3 && facts.length >= 1 && terms.length >= 1,
      },
    };
  }

  async getUsers(): Promise<User[]> {
    try {
      const res = await fetch(apiUrl('/api/users'), { headers: this.getHeaders() });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (_) {}
    return store.users;
  }

  async createUser(data: Partial<User>): Promise<User> {
    const newUser: User = {
      user_id: `u-${Date.now()}`,
      org_id: store.organisations[0].org_id,
      full_name: data.full_name || 'New Team Member',
      email: data.email || 'user@lumora.test',
      role: data.role || 'creator',
      is_active: true,
      created_at: new Date().toISOString(),
    };
    store.users.push(newUser);
    store.persist();
    return newUser;
  }

  async updateUserRole(userId: string, role: any): Promise<User> {
    const target = store.users.find((u) => u.user_id === userId);
    if (!target) throw new Error('User not found');
    target.role = role;
    store.persist();
    return target;
  }

  async getProfiles(): Promise<BrandProfile[]> {
    return store.profiles;
  }

  async updateProfile(profileId: string, data: Partial<BrandProfile>): Promise<BrandProfile> {
    const profile = store.profiles.find((p) => p.profile_id === profileId);
    if (!profile) throw new Error('Profile not found');
    Object.assign(profile, data);
    store.persist();
    return profile;
  }

  async getGuidelines(profileId: string): Promise<BrandGuideline[]> {
    return store.guidelines.filter((g) => g.profile_id === profileId && g.is_active);
  }

  async createGuideline(profileId: string, data: Partial<BrandGuideline>): Promise<BrandGuideline> {
    const newG: BrandGuideline = {
      guideline_id: `g-${Date.now()}`,
      profile_id: profileId,
      code: data.code || `G-${store.guidelines.length + 1}`,
      title: data.title || 'New Guideline',
      category: data.category || 'general',
      rule_text: data.rule_text || '',
      content_types: data.content_types || [],
      example_good: data.example_good,
      example_bad: data.example_bad,
      version: 1,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    store.guidelines.push(newG);
    store.persist();
    return newG;
  }

  async updateGuideline(id: string, data: Partial<BrandGuideline>): Promise<BrandGuideline> {
    const existing = store.guidelines.find((g) => g.guideline_id === id);
    if (!existing) throw new Error('Guideline not found');

    existing.is_active = false;
    const newVersion: BrandGuideline = {
      ...existing,
      ...data,
      guideline_id: `g-${Date.now()}`,
      version: existing.version + 1,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    store.guidelines.push(newVersion);
    store.persist();
    return newVersion;
  }

  async getFacts(profileId: string): Promise<ApprovedFact[]> {
    return store.facts.filter((f) => f.profile_id === profileId);
  }

  async createFact(profileId: string, data: Partial<ApprovedFact>): Promise<ApprovedFact> {
    const newFact: ApprovedFact = {
      fact_id: `f-${Date.now()}`,
      profile_id: profileId,
      code: data.code || `F-${store.facts.length + 1}`,
      subject: data.subject || data.statement?.slice(0, 30) || 'Fact Subject',
      statement: data.statement || '',
      source_ref: data.source_ref,
      valid_until: data.valid_until,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    store.facts.push(newFact);
    store.persist();
    return newFact;
  }

  async getTerms(profileId: string): Promise<TerminologyItem[]> {
    return store.terms.filter((t) => t.profile_id === profileId);
  }

  async createTerm(profileId: string, data: Partial<TerminologyItem>): Promise<TerminologyItem> {
    const newTerm: TerminologyItem = {
      term_id: `t-${Date.now()}`,
      profile_id: profileId,
      code: data.code || `T-${store.terms.length + 1}`,
      preferred_term: data.preferred_term || '',
      avoid_terms: Array.isArray(data.avoid_terms) ? data.avoid_terms : [data.avoid_terms || ''],
      notes: data.notes,
      case_sensitive: Boolean(data.case_sensitive),
    };
    store.terms.push(newTerm);
    store.persist();
    return newTerm;
  }

  async getAssets(profileId: string): Promise<BrandAsset[]> {
    return store.assets.filter((a) => a.profile_id === profileId);
  }

  async createAsset(profileId: string, data: Partial<BrandAsset>): Promise<BrandAsset> {
    const newAsset: BrandAsset = {
      asset_id: `ast-${Date.now()}`,
      profile_id: profileId,
      asset_type: data.asset_type || 'image',
      name: data.name || 'New Brand Asset',
      file_url: data.file_url || '',
      alt_text: data.alt_text,
      created_at: new Date().toISOString(),
    };
    store.assets.push(newAsset);
    store.persist();
    return newAsset;
  }

  async getSubmissions(filter?: { status?: string; q?: string }): Promise<ContentSubmission[]> {
    let list = [...store.submissions];
    const user = this.getCurrentUser();
    if (user.role === 'creator' && store.profiles[0].team_visibility !== 'team') {
      list = list.filter((s) => s.creator_id === user.user_id);
    }
    if (filter?.status) list = list.filter((s) => s.status === filter.status);
    if (filter?.q) list = list.filter((s) => s.title.toLowerCase().includes(filter.q!.toLowerCase()));
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async getSubmissionById(id: string): Promise<{
    submission: ContentSubmission;
    currentVersion: ContentVersion;
    latestReport: AnalysisReport | null;
    approvals: ApprovalRecord[];
  }> {
    const sub = store.getSubmissionById(id);
    if (!sub) throw new Error('Submission not found');
    const currentVersion = store.getLatestVersion(sub.submission_id);
    if (!currentVersion) throw new Error('Version not found');
    const latestReport = store.getReportByVersionId(currentVersion.version_id) || null;
    const approvals = store.approvals.filter((a) =>
      store.versions.some((v) => v.submission_id === sub.submission_id && v.version_id === a.version_id)
    );

    return { submission: sub, currentVersion, latestReport, approvals };
  }

  async createSubmission(data: {
    title: string;
    content_type: any;
    profile_id: string;
    body_text: string;
    media: any[];
    links: any[];
  }) {
    const user = this.getCurrentUser();
    const subId = `sub-${Date.now()}`;
    const verId = `ver-${subId}-v1`;
    const newSub: ContentSubmission = {
      submission_id: subId,
      profile_id: data.profile_id,
      creator_id: user.user_id,
      creator_name: user.full_name,
      title: data.title,
      content_type: data.content_type,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const newVer: ContentVersion = {
      version_id: verId,
      submission_id: subId,
      version_no: 1,
      body_text: data.body_text,
      media: data.media,
      links: data.links,
      source: 'creator_submit',
      created_by: user.user_id,
      created_by_name: user.full_name,
      created_at: new Date().toISOString(),
    };
    store.submissions.unshift(newSub);
    store.versions.unshift(newVer);
    store.persist();
    return { submission: newSub, version: newVer };
  }

  async triggerAnalysis(submissionId: string) {
    const sub = store.getSubmissionById(submissionId);
    if (!sub) throw new Error('Submission not found');
    const ver = store.getLatestVersion(submissionId);
    if (!ver) throw new Error('Version not found');

    const { runAnalysisPipeline } = await import('../services/aiPipeline');
    const profile = store.profiles[0];
    const output = await runAnalysisPipeline({
      draft: ver.body_text,
      contentType: sub.content_type,
      profile,
      guidelines: store.guidelines.filter((g) => g.is_active),
      facts: store.facts.filter((f) => f.is_active),
      terms: store.terms,
      media: ver.media,
      links: ver.links,
    });

    const reportId = `rep-${Date.now()}`;
    const fullReport: AnalysisReport = {
      report_id: reportId,
      version_id: ver.version_id,
      summary: output.report.summary,
      model_name: output.report.model_name || 'gemini-3.8-flash',
      modelName: output.report.model_name || 'gemini-3.8-flash',
      ai_status: output.report.ai_status,
      created_at: new Date().toISOString(),
      issues: output.report.issues.map((i, idx) => ({
        ...i,
        report_id: reportId,
        issue_id: `iss-${reportId}-${idx + 1}`,
      })),
    };

    store.reports = store.reports.filter((r) => r.version_id !== ver.version_id);
    store.reports.unshift(fullReport);
    sub.status = 'in_correction';
    sub.updated_at = new Date().toISOString();
    store.persist();

    return fullReport;
  }

  async updateSuggestion(
    suggestionId: string,
    action: 'accept' | 'edit' | 'dismiss',
    finalText?: string,
    reason?: string
  ) {
    const mappedStatus: SuggestionStatus =
      action === 'accept' ? 'accepted' : action === 'edit' ? 'edited' : 'dismissed';

    for (const rep of store.reports) {
      for (const iss of rep.issues) {
        if (iss.suggestion && (iss.suggestion.suggestion_id === suggestionId || iss.issue_id === suggestionId)) {
          iss.suggestion.status = mappedStatus;
          if (action === 'edit') iss.suggestion.final_text = finalText;
          if (action === 'dismiss') iss.suggestion.dismiss_reason = reason;
          store.persist();
          return iss.suggestion;
        }
      }
    }
    throw new Error('Suggestion not found');
  }

  async saveNewVersion(
    submissionId: string,
    bodyText: string,
    source: 'creator_submit' | 'ai_applied' | 'edited' = 'edited'
  ) {
    const sub = store.getSubmissionById(submissionId);
    if (!sub) throw new Error('Submission not found');

    const versions = store.getVersionsBySubmissionId(submissionId);
    const nextVerNo = versions.length + 1;
    const newVerId = `ver-${submissionId}-v${nextVerNo}`;
    const user = this.getCurrentUser();

    const newVersion: ContentVersion = {
      version_id: newVerId,
      submission_id: submissionId,
      version_no: nextVerNo,
      body_text: bodyText,
      media: versions[versions.length - 1]?.media || [],
      links: versions[versions.length - 1]?.links || [],
      source,
      created_by: user.user_id,
      created_by_name: user.full_name,
      created_at: new Date().toISOString(),
    };

    store.versions.push(newVersion);
    sub.status = 'in_correction';
    sub.updated_at = new Date().toISOString();

    // Auto-run analysis on the new version
    const { runAnalysisPipeline } = await import('../services/aiPipeline');
    const profile = store.profiles[0];
    const output = await runAnalysisPipeline({
      draft: newVersion.body_text,
      contentType: sub.content_type,
      profile,
      guidelines: store.guidelines.filter((g) => g.is_active),
      facts: store.facts.filter((f) => f.is_active),
      terms: store.terms,
      media: newVersion.media,
      links: newVersion.links,
    });

    const reportId = `rep-${Date.now()}`;
    const fullReport: AnalysisReport = {
      report_id: reportId,
      version_id: newVerId,
      summary: output.report.summary,
      model_name: output.report.model_name || 'gemini-3.8-flash',
      modelName: output.report.model_name || 'gemini-3.8-flash',
      ai_status: output.report.ai_status,
      created_at: new Date().toISOString(),
      issues: output.report.issues.map((i, idx) => ({
        ...i,
        report_id: reportId,
        issue_id: `iss-${reportId}-${idx + 1}`,
      })),
    };

    store.reports.unshift(fullReport);
    store.persist();

    return { version: newVersion, report: fullReport };
  }

  async sendForReview(submissionId: string) {
    const sub = store.getSubmissionById(submissionId);
    if (!sub) throw new Error('Submission not found');
    const latestVer = store.getLatestVersion(submissionId);
    const report = latestVer ? store.getReportByVersionId(latestVer.version_id) : null;
    const user = this.getCurrentUser();

    const { transition } = await import('../services/statusMachine');
    const result = transition(
      sub.status,
      'send_for_review',
      { user_id: user.user_id, role: user.role, isCreator: sub.creator_id === user.user_id },
      { issues: report ? report.issues : [] }
    );

    if (!result.ok) {
      throw new Error(result.errorMessage || 'Cannot send for review');
    }

    sub.status = result.nextStatus!;
    sub.updated_at = new Date().toISOString();
    store.persist();
    return sub;
  }

  async submitDecision(versionId: string, decision: 'approved' | 'changes_requested', comment?: string, visualChecklist?: any) {
    const version = store.versions.find((v) => v.version_id === versionId);
    if (!version) throw new Error('Version not found');
    const sub = store.getSubmissionById(version.submission_id);
    if (!sub) throw new Error('Submission not found');
    const latestVer = store.getLatestVersion(sub.submission_id);
    const isCurrentVersion = latestVer?.version_id === version.version_id;
    const user = this.getCurrentUser();

    const { transition } = await import('../services/statusMachine');
    const machineEvent = decision === 'approved' ? 'decision_approve' : 'decision_request_changes';
    const result = transition(
      sub.status,
      machineEvent,
      { user_id: user.user_id, role: user.role, isCreator: sub.creator_id === user.user_id },
      { comment, isCurrentVersion }
    );

    if (!result.ok) {
      throw new Error(result.errorMessage || 'Decision failed');
    }

    sub.status = result.nextStatus!;
    sub.updated_at = new Date().toISOString();

    const approvalRecord: ApprovalRecord = {
      approval_id: `appr-${Date.now()}`,
      version_id: version.version_id,
      reviewer_id: user.user_id,
      reviewer_name: user.full_name,
      decision,
      comment,
      visual_checklist: visualChecklist,
      decided_at: new Date().toISOString(),
    };

    store.approvals.push(approvalRecord);
    store.persist();
    return { submission: sub, approval: approvalRecord };
  }

  async getReviewQueue() {
    const inReviewSubs = store.submissions.filter((s) => s.status === 'in_review');
    return inReviewSubs.map((sub) => {
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
  }

  async getAnalyticsSummary() {
    const total = store.submissions.length;
    const approved = store.submissions.filter((s) => s.status === 'approved').length;
    const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;
    const allReports = store.reports;
    const clean = allReports.filter((r) => r.summary.high === 0).length;
    const cleanDraftRate = allReports.length > 0 ? Math.round((clean / allReports.length) * 100) : 100;

    return {
      metrics: {
        totalSubmissions: total,
        approvalRate,
        avgRevisions: '1.2',
        cleanDraftRate,
        aiUnavailableRuns: 0,
      },
      categoryMix: {
        fact_conflict: 8,
        unsupported_claim: 14,
        terminology: 22,
        tone: 16,
        accessibility: 7,
      },
      severityMix: { high: 8, medium: 21, low: 38 },
      unclearRules: [
        {
          code: 'G-07',
          title: 'Exclamation & Punctuation Discipline',
          triggers: 16,
          dismissals: 8,
          dismissRate: 50,
          topReasons: ['Expressive excitement needed in seasonal sales campaign', 'Style fit for fitness push'],
        },
      ],
      topTriggeredRules: [
        { code: 'T-01', count: 22 },
        { code: 'G-07', count: 16 },
        { code: 'G-15', count: 14 },
        { code: 'F-12', count: 8 },
        { code: 'G-10', count: 7 },
      ],
    };
  }

  async runBenchmarkEval() {
    const { runAnalysisPipeline } = await import('../services/aiPipeline');
    const profile = store.profiles[0];
    const guidelines = store.guidelines.filter((g) => g.is_active);
    const facts = store.facts.filter((f) => f.is_active);
    const terms = store.terms;

    const results = [];
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
    return {
      total: results.length,
      passedCount,
      accuracyRate: Math.round((passedCount / results.length) * 100),
      testCases: results,
    };
  }

  // -----------------------------------------------------------
  // SOCIAL PUBLISHING & COMMENTS METHODS (SECTION 3 OF SPEC)
  // -----------------------------------------------------------

  async getSocialProviders() {
    return [
      {
        provider: 'meta_facebook' as SocialProvider,
        name: 'Meta Facebook Pages',
        description: 'Publish text, photos, and video updates to official brand pages via Meta Graph API.',
        icon: 'facebook',
        supportedTypes: ['page'],
        maxCharacters: 63206,
        requiresMedia: false,
        supportsScheduling: true,
        scopes: ['pages_manage_posts', 'pages_read_engagement', 'publish_video'],
      },
      {
        provider: 'meta_instagram' as SocialProvider,
        name: 'Instagram Professional',
        description: 'Publish photo carousels, single visuals, and captions to connected business profiles.',
        icon: 'instagram',
        supportedTypes: ['professional'],
        maxCharacters: 2200,
        requiresMedia: true,
        supportsScheduling: true,
        scopes: ['instagram_basic', 'instagram_content_publish', 'instagram_manage_insights'],
      },
      {
        provider: 'linkedin' as SocialProvider,
        name: 'LinkedIn Company & Member',
        description: 'Publish approved thought-leadership articles, updates, and links to Company Pages.',
        icon: 'linkedin',
        supportedTypes: ['organization', 'member'],
        maxCharacters: 3000,
        requiresMedia: false,
        supportsScheduling: true,
        scopes: ['w_organization_social', 'r_organization_social', 'rw_organization_admin'],
      },
      {
        provider: 'x_twitter' as SocialProvider,
        name: 'X (formerly Twitter)',
        description: 'Extensible adapter for broadcasting real-time campaign announcements and short updates.',
        icon: 'twitter',
        supportedTypes: ['member'],
        maxCharacters: 280,
        requiresMedia: false,
        supportsScheduling: true,
        scopes: ['tweet.read', 'tweet.write', 'users.read'],
      },
    ];
  }

  async getSocialAccounts(): Promise<SocialAccount[]> {
    return store.getSocialAccounts();
  }

  async connectSocialAccount(data: {
    provider: SocialProvider;
    displayName: string;
    handle?: string;
    accountType?: 'page' | 'professional' | 'organization' | 'member';
    scopes?: string[];
  }): Promise<SocialAccount> {
    const user = this.getCurrentUser();
    const newAccount: SocialAccount = {
      account_id: `soc-${Date.now()}`,
      provider: data.provider,
      external_account_id: `ext-${Date.now()}`,
      display_name: data.displayName,
      account_handle: data.handle || `@${data.displayName.toLowerCase().replace(/\s+/g, '')}`,
      account_type: data.accountType || (data.provider === 'meta_facebook' ? 'page' : data.provider === 'meta_instagram' ? 'professional' : 'organization'),
      granted_scopes: data.scopes || ['publish_content', 'read_engagement'],
      status: 'connected',
      last_verified_at: new Date().toISOString(),
      owner_id: user.user_id,
      created_at: new Date().toISOString(),
    };
    return store.connectSocialAccount(newAccount);
  }

  async disconnectSocialAccount(id: string): Promise<SocialAccount | undefined> {
    return store.disconnectSocialAccount(id);
  }

  async getSocialVariants(submissionId: string): Promise<SocialPostVariant[]> {
    return store.getVariantsBySubmissionId(submissionId);
  }

  async createSocialVariant(data: {
    submissionId: string;
    sourceVersionId: string;
    provider: SocialProvider;
    targetAccountId: string;
    caption: string;
    hashtags?: string[];
    mediaUrls?: string[];
    altTexts?: string[];
  }): Promise<SocialPostVariant> {
    const charLimits: Record<SocialProvider, number> = {
      meta_facebook: 63206,
      meta_instagram: 2200,
      linkedin: 3000,
      x_twitter: 280,
    };

    const variant: SocialPostVariant = {
      variant_id: `var-${Date.now()}`,
      submission_id: data.submissionId,
      source_version_id: data.sourceVersionId,
      provider: data.provider,
      target_account_id: data.targetAccountId,
      caption: data.caption,
      hashtags: data.hashtags || [],
      media_urls: data.mediaUrls || [],
      alt_texts: data.altTexts || [],
      character_limit: charLimits[data.provider] || 2200,
      is_approved: true, // initial creation from approved submission is considered approved
      approval_status: 'approved',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return store.saveSocialVariant(variant);
  }

  async getPublishJobs(): Promise<PublishJob[]> {
    return store.getPublishJobs();
  }

  async getPublishResults(): Promise<PublishResult[]> {
    return store.getPublishResults();
  }

  async schedulePublish(data: {
    variantId?: string;
    submissionId: string;
    accountId: string;
    provider: SocialProvider;
    caption: string;
    mediaUrls?: string[];
    scheduledTime: string;
    timezone?: string;
  }): Promise<PublishJob> {
    const user = this.getCurrentUser();
    const sub = store.getSubmissionById(data.submissionId);

    // Rule: Never publish an unapproved submission!
    if (sub && sub.status !== 'approved') {
      throw new Error(`Cannot schedule unapproved submission. Current state: ${sub.status}. Human approval is mandatory.`);
    }

    const job: PublishJob = {
      job_id: `pub-job-${Date.now()}`,
      variant_id: data.variantId || `var-${Date.now()}`,
      account_id: data.accountId,
      submission_id: data.submissionId,
      submission_title: sub?.title || 'Brand Social Update',
      provider: data.provider,
      caption: data.caption,
      media_urls: data.mediaUrls,
      scheduled_time: data.scheduledTime,
      timezone: data.timezone || 'UTC',
      status: 'scheduled',
      retry_count: 0,
      idempotency_key: `idem-${Date.now()}-${data.provider}`,
      created_by: user.user_id,
      created_by_name: user.full_name,
      created_at: new Date().toISOString(),
    };

    return store.createPublishJob(job);
  }

  async publishNow(data: {
    variantId?: string;
    submissionId: string;
    accountId: string;
    provider: SocialProvider;
    caption: string;
    mediaUrls?: string[];
  }): Promise<{ job: PublishJob; result: PublishResult }> {
    const user = this.getCurrentUser();
    const sub = store.getSubmissionById(data.submissionId);

    // Rule 6 & 7: Human approval is mandatory before publication. Publish only exact approved version.
    if (sub && sub.status !== 'approved') {
      throw new Error(`Cannot publish unapproved submission. Current state: ${sub.status}. Human approval is mandatory.`);
    }

    const account = store.getSocialAccountById(data.accountId);
    if (account && account.status !== 'connected') {
      throw new Error(`Social account "${account.display_name}" is disconnected. Reconnect before publishing.`);
    }

    // Provider-specific URL generators
    const postId = `post_${Math.floor(100000000 + Math.random() * 900000000)}`;
    const urlMap: Record<SocialProvider, string> = {
      linkedin: `https://www.linkedin.com/feed/update/urn:li:share:${postId}`,
      meta_facebook: `https://www.facebook.com/permalink.php?story_fbid=${postId}&id=${account?.external_account_id || 'lumora'}`,
      meta_instagram: `https://www.instagram.com/p/C${postId.slice(0, 6)}/`,
      x_twitter: `https://x.com/LumoraHQ/status/${postId}`,
    };

    const jobId = `pub-job-${Date.now()}`;
    const job: PublishJob = {
      job_id: jobId,
      variant_id: data.variantId || `var-${Date.now()}`,
      account_id: data.accountId,
      submission_id: data.submissionId,
      submission_title: sub?.title || 'Brand Social Update',
      provider: data.provider,
      caption: data.caption,
      media_urls: data.mediaUrls,
      scheduled_time: new Date().toISOString(),
      timezone: 'UTC',
      status: 'published',
      retry_count: 0,
      idempotency_key: `idem-${Date.now()}-${data.provider}`,
      created_by: user.user_id,
      created_by_name: user.full_name,
      created_at: new Date().toISOString(),
      executed_at: new Date().toISOString(),
    };

    store.createPublishJob(job);

    const result: PublishResult = {
      result_id: `res-${Date.now()}`,
      job_id: jobId,
      provider: data.provider,
      provider_post_id: postId,
      provider_url: urlMap[data.provider],
      published_at: new Date().toISOString(),
      status: 'success',
      response_metadata: {
        httpStatus: 200,
        providerConfirmed: true,
        actor: user.full_name,
        targetAccount: account?.display_name,
      },
    };

    store.recordPublishResult(result);
    return { job, result };
  }

  async cancelPublishJob(jobId: string): Promise<PublishJob | undefined> {
    const job = store.updatePublishJobStatus(jobId, 'cancelled');
    return job;
  }

  async retryPublishJob(jobId: string): Promise<PublishJob | undefined> {
    const existing = store.getPublishJobById(jobId);
    if (!existing) throw new Error('Job not found');
    const job = store.updatePublishJobStatus(jobId, 'published');
    if (job) {
      job.retry_count = (job.retry_count || 0) + 1;
      store.recordPublishResult({
        result_id: `res-${Date.now()}`,
        job_id: jobId,
        provider: job.provider,
        provider_post_id: `post_retry_${Date.now()}`,
        provider_url: `https://${job.provider}.com/posts/${Date.now()}`,
        published_at: new Date().toISOString(),
        status: 'success',
      });
    }
    return job;
  }

  async getComments(submissionId: string): Promise<ReviewComment[]> {
    return store.getCommentsBySubmissionId(submissionId);
  }

  async addComment(data: {
    submissionId: string;
    versionId: string;
    body: string;
    issueId?: string;
    parentCommentId?: string;
  }): Promise<ReviewComment> {
    const user = this.getCurrentUser();
    const comment: ReviewComment = {
      comment_id: `comm-${Date.now()}`,
      version_id: data.versionId,
      author_id: user.user_id,
      author_name: user.full_name,
      author_role: user.role,
      issue_id: data.issueId,
      parent_comment_id: data.parentCommentId,
      body: data.body,
      created_at: new Date().toISOString(),
    };
    return store.addComment(comment);
  }

  async getDatabaseHealth(): Promise<SupabaseHealthReport> {
    return supabaseService.checkHealth();
  }

  async syncToDatabase(): Promise<{ success: boolean; synced: number; error?: string }> {
    const org = store.organisations[0];
    const profile = store.profiles[0];
    const guidelines = store.guidelines;
    const facts = store.facts;
    const terms = store.terms;
    const res = await supabaseService.syncBrandKnowledge(org, profile, guidelines, facts, terms);

    // Also sync latest submissions
    for (const sub of store.submissions.slice(0, 10)) {
      const ver = store.getLatestVersion(sub.submission_id);
      await supabaseService.persistSubmission(sub, ver);
    }

    return { success: !res.error, synced: res.synced, error: res.error };
  }

  // -------------------------------------------------------------
  // AUTOMATED VISUAL BRAND CHECKING API CLIENT METHODS
  // -------------------------------------------------------------
  // VISUAL BRAND CHECKING APIS (Phase 6 / Visual Audit)
  // -------------------------------------------------------------

  async runVisualCheck(
    versionId: string,
    payload?: { media_index?: number; rawBase64?: string; imageName?: string; media?: any; imageUrl?: string } | number
  ): Promise<VisualCheckReport> {
    const body = typeof payload === 'number' ? { media_index: payload } : payload || {};
    const res = await fetch(apiUrl(`/api/versions/${versionId}/visual-check`), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || `Visual check failed (${res.status})`);
    }

    const json = await res.json();
    return json.data;
  }

  async getVisualCheck(versionId: string, history = false): Promise<VisualCheckReport | null> {
    try {
      const url = history
        ? `/api/versions/${versionId}/visual-check?history=1`
        : `/api/versions/${versionId}/visual-check`;
      const res = await fetch(apiUrl(url), {
        headers: this.getHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (_) {}
    return null;
  }

  async getVisualCheckStatus(reportId: string): Promise<{ stage: string; pct: number }> {
    try {
      const res = await fetch(apiUrl(`/api/visual-checks/${reportId}/status`), {
        headers: this.getHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (_) {}
    return { stage: 'completed', pct: 100 };
  }

  async updateVisualIssue(
    issueId: string,
    reviewStatus: VisualIssueReviewStatus,
    comment?: string
  ): Promise<VisualBrandIssue> {
    const res = await fetch(apiUrl(`/api/visual-issues/${issueId}`), {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ review_status: reviewStatus, comment }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || 'Failed to update visual issue');
    }

    const json = await res.json();
    return json.data;
  }

  async addVisualIssueComment(
    issueId: string,
    comment: string
  ): Promise<VisualBrandIssue> {
    const res = await fetch(apiUrl(`/api/visual-issues/${issueId}/comments`), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ comment }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || 'Failed to post reviewer comment');
    }

    const json = await res.json();
    return json.data;
  }

  async getVisualReferences(profileId: string): Promise<{
    profile_id: string;
    name: string;
    palette: string[];
    logos: BrandAsset[];
    all_assets: BrandAsset[];
    visual_guidelines: BrandGuideline[];
    readiness?: { has_logo: boolean; has_palette: boolean };
  }> {
    try {
      const res = await fetch(apiUrl(`/api/brand-profiles/${profileId}/visual-references`), {
        headers: this.getHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (_) {}

    const profile = store.profiles.find((p) => p.profile_id === profileId) || store.profiles[0];
    return {
      profile_id: profile.profile_id,
      name: profile.name,
      palette: profile.palette || ['#0B1B3A', '#139A93', '#F4F6F9', '#FFFFFF', '#E65100'],
      logos: store.assets.filter((a) => a.asset_type === 'logo'),
      all_assets: store.assets,
      visual_guidelines: store.guidelines.filter((g) => g.category === 'visual'),
      readiness: {
        has_logo: store.assets.some((a) => a.asset_type === 'logo'),
        has_palette: true,
      },
    };
  }

  async getVersionDiff(versionId: string): Promise<DiffChunk[]> {
    try {
      const res = await fetch(apiUrl(`/api/versions/${versionId}/diff`), {
        headers: this.getHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || [];
      }
    } catch (_) {}
    return [];
  }
}

export const api = new ApiClient();
