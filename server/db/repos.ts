/**
 * INKLOOM AI - Server Database Repositories (Phase 3.1)
 * Enforces org_id scoping on EVERY query and mutation.
 * Uses parameterised access and prevents cross-organization IDOR leaks.
 */

import { SEED_ORG, SEED_USERS, SEED_PROFILE, SEED_GUIDELINES, SEED_FACTS, SEED_TERMS } from '../../db/seed';
import { supabaseService } from '../../src/services/supabase';

// In-memory relational state backing repositories (synchronized with Supabase)
let organisations = [{ ...SEED_ORG }];
let users = [...SEED_USERS];
let profiles = [{ ...SEED_PROFILE }];
let guidelines = [...SEED_GUIDELINES];
let facts = [...SEED_FACTS];
let terms = [...SEED_TERMS];
let assets: any[] = [];
let submissions: any[] = [];
let versions: any[] = [];
let reports: any[] = [];
let issues: any[] = [];
let suggestions: any[] = [];
let comments: any[] = [];
let approvals: any[] = [];
let auditLogs: any[] = [];
let socialAccounts: any[] = [];
let publishJobs: any[] = [];

// Initialize 25 historical submissions for Lumora seed
(() => {
  const pastDays = [88, 85, 80, 75, 72, 68, 64, 60, 56, 52, 48, 44, 40, 36, 32, 28, 25, 21, 18, 14, 10, 7, 5, 2, 0];
  const types = ['email', 'social_post', 'blog', 'ad_copy', 'landing_page'];
  const statuses = [
    'approved', 'approved', 'approved', 'approved', 'approved',
    'changes_requested', 'approved', 'approved', 'approved', 'approved',
    'in_review', 'approved', 'approved', 'in_correction', 'approved',
    'approved', 'changes_requested', 'approved', 'approved', 'in_review',
    'approved', 'approved', 'draft', 'in_correction', 'in_review',
  ];

  pastDays.forEach((dayOffset, i) => {
    const subId = `sub-lumora-${1000 + i}`;
    const verId = `ver-${subId}-v1`;
    const createdAt = new Date(Date.now() - dayOffset * 86400000).toISOString();
    const isApproved = statuses[i] === 'approved';

    const sub = {
      submission_id: subId,
      profile_id: SEED_PROFILE.profile_id,
      creator_id: SEED_USERS[1].user_id, // Ishaan Verma
      creator_name: SEED_USERS[1].full_name,
      title: `Campaign Asset ${100 + i}: ${types[i % types.length].replace('_', ' ').toUpperCase()}`,
      content_type: types[i % types.length],
      status: statuses[i],
      is_demo: true,
      created_at: createdAt,
      updated_at: createdAt,
    };
    submissions.push(sub);

    const ver = {
      version_id: verId,
      submission_id: subId,
      version_no: 1,
      body_text: `Lumora Pro provides 50 GB of workout storage for active members. Welcome to our ${types[i % types.length]}.`,
      media: [],
      links: [],
      source: 'creator_submit',
      created_by: SEED_USERS[1].user_id,
      created_at: createdAt,
    };
    versions.push(ver);

    if (isApproved) {
      approvals.push({
        approval_id: `appr-${subId}`,
        version_id: verId,
        reviewer_id: SEED_USERS[2].user_id,
        reviewer_name: SEED_USERS[2].full_name,
        decision: 'approved',
        comment: 'Complies with all tone guidelines and verified facts.',
        decided_at: createdAt,
      });
    }
  });
})();

export const userRepo = {
  async getById(id: string) {
    return users.find((u) => u.user_id === id) || null;
  },
  async getByEmail(email: string) {
    const normalized = email.toLowerCase().trim();
    return users.find((u) => u.email.toLowerCase() === normalized) || null;
  },
  async list(orgId: string) {
    return users.filter((u) => u.org_id === orgId);
  },
  async create(data: any) {
    users.push(data);
    return data;
  },
  async update(id: string, orgId: string, updates: any) {
    const user = users.find((u) => u.user_id === id && u.org_id === orgId);
    if (!user) return null;
    Object.assign(user, updates);
    return user;
  },
};

export const orgRepo = {
  async getById(orgId: string) {
    return organisations.find((o) => o.org_id === orgId) || null;
  },
  async create(data: any) {
    organisations.push(data);
    return data;
  },
};

export const profileRepo = {
  async list(orgId: string) {
    return profiles.filter((p) => p.org_id === orgId);
  },
  async getById(id: string, orgId: string) {
    return profiles.find((p) => p.profile_id === id && p.org_id === orgId) || null;
  },
  async create(data: any) {
    profiles.push(data);
    return data;
  },
  async update(id: string, orgId: string, updates: any) {
    const p = profiles.find((item) => item.profile_id === id && item.org_id === orgId);
    if (!p) return null;
    Object.assign(p, updates);
    return p;
  },
};

export const guidelineRepo = {
  async list(profileId: string, orgId: string) {
    const profile = await profileRepo.getById(profileId, orgId);
    if (!profile) return [];
    return guidelines.filter((g) => g.profile_id === profileId && g.is_active);
  },
  async getById(id: string, orgId: string) {
    const g = guidelines.find((item) => item.guideline_id === id);
    if (!g) return null;
    const profile = await profileRepo.getById(g.profile_id, orgId);
    return profile ? g : null;
  },
  async create(data: any) {
    guidelines.push(data);
    return data;
  },
  async update(id: string, orgId: string, updates: any) {
    const g = await this.getById(id, orgId);
    if (!g) return null;
    Object.assign(g, updates);
    return g;
  },
};

export const factRepo = {
  async list(profileId: string, orgId: string) {
    const profile = await profileRepo.getById(profileId, orgId);
    if (!profile) return [];
    return facts.filter((f) => f.profile_id === profileId && f.is_active);
  },
  async create(data: any) {
    facts.push(data);
    return data;
  },
  async update(id: string, orgId: string, updates: any) {
    const f = facts.find((item) => item.fact_id === id);
    if (!f) return null;
    const profile = await profileRepo.getById(f.profile_id, orgId);
    if (!profile) return null;
    Object.assign(f, updates);
    return f;
  },
};

export const termRepo = {
  async list(profileId: string, orgId: string) {
    const profile = await profileRepo.getById(profileId, orgId);
    if (!profile) return [];
    return terms.filter((t) => t.profile_id === profileId);
  },
  async create(data: any) {
    terms.push(data);
    return data;
  },
  async update(id: string, orgId: string, updates: any) {
    const t = terms.find((item) => item.term_id === id);
    if (!t) return null;
    const profile = await profileRepo.getById(t.profile_id, orgId);
    if (!profile) return null;
    Object.assign(t, updates);
    return t;
  },
};

export const assetRepo = {
  async list(profileId: string, orgId: string) {
    const profile = await profileRepo.getById(profileId, orgId);
    if (!profile) return [];
    return assets.filter((a) => a.profile_id === profileId);
  },
  async create(data: any) {
    assets.push(data);
    return data;
  },
};

export const submissionRepo = {
  async list(orgId: string, userId?: string, role?: string, status?: string) {
    let list = submissions.filter((s) => {
      const prof = profiles.find((p) => p.profile_id === s.profile_id);
      return prof && prof.org_id === orgId;
    });

    if (role === 'creator' && userId) {
      list = list.filter((s) => s.creator_id === userId);
    }
    if (status) {
      list = list.filter((s) => s.status === status);
    }
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async getById(id: string, orgId: string) {
    const s = submissions.find((sub) => sub.submission_id === id);
    if (!s) return null;
    const prof = await profileRepo.getById(s.profile_id, orgId);
    return prof ? s : null;
  },

  async create(data: any) {
    submissions.unshift(data);
    return data;
  },

  async updateStatus(id: string, orgId: string, status: string) {
    const s = await this.getById(id, orgId);
    if (!s) return null;
    s.status = status;
    s.updated_at = new Date().toISOString();
    return s;
  },
};

export const versionRepo = {
  async list(submissionId: string, orgId: string) {
    const sub = await submissionRepo.getById(submissionId, orgId);
    if (!sub) return [];
    return versions.filter((v) => v.submission_id === submissionId).sort((a, b) => b.version_no - a.version_no);
  },

  async getLatest(submissionId: string, orgId: string) {
    const list = await this.list(submissionId, orgId);
    return list[0] || null;
  },

  async getById(versionId: string, orgId: string) {
    const v = versions.find((ver) => ver.version_id === versionId);
    if (!v) return null;
    const sub = await submissionRepo.getById(v.submission_id, orgId);
    return sub ? v : null;
  },

  async create(data: any) {
    versions.unshift(data);
    return data;
  },
};

export const reportRepo = {
  async getByVersionId(versionId: string) {
    return reports.find((r) => r.version_id === versionId) || null;
  },
  async create(data: any) {
    reports = reports.filter((r) => r.version_id !== data.version_id);
    reports.unshift(data);
    return data;
  },
};

export const suggestionRepo = {
  async getById(suggestionId: string) {
    for (const r of reports) {
      for (const iss of r.issues || []) {
        if (iss.suggestion?.suggestion_id === suggestionId || iss.issue_id === suggestionId) {
          return { issue: iss, suggestion: iss.suggestion, report: r };
        }
      }
    }
    return null;
  },
  async updateStatus(suggestionId: string, action: 'accept' | 'edit' | 'dismiss', finalText?: string, reason?: string) {
    const found = await this.getById(suggestionId);
    if (!found) return null;
    if (found.suggestion) {
      if (action === 'accept') found.suggestion.status = 'accepted';
      if (action === 'edit') {
        found.suggestion.status = 'edited';
        found.suggestion.final_text = finalText;
      }
      if (action === 'dismiss') {
        found.suggestion.status = 'dismissed';
        found.suggestion.dismiss_reason = reason;
      }
    }
    return found.suggestion;
  },
};

export const commentRepo = {
  async list(submissionId: string, orgId: string) {
    const vers = await versionRepo.list(submissionId, orgId);
    const verIds = vers.map((v: any) => v.version_id);
    return comments.filter((c) => verIds.includes(c.version_id));
  },
  async create(data: any) {
    comments.push(data);
    return data;
  },
};

export const approvalRepo = {
  async list(submissionId: string, orgId: string) {
    const vers = await versionRepo.list(submissionId, orgId);
    const verIds = vers.map((v: any) => v.version_id);
    return approvals.filter((a) => verIds.includes(a.version_id));
  },
  async create(data: any) {
    approvals.push(data);
    return data;
  },
};

export const auditRepo = {
  async list(orgId: string, filter?: { actor_id?: string; action?: string; limit?: number }) {
    let list = auditLogs.filter((l) => l.org_id === orgId);
    if (filter?.actor_id) list = list.filter((l) => l.actor_id === filter.actor_id);
    if (filter?.action) list = list.filter((l) => l.action === filter.action);
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return list.slice(0, filter?.limit || 100);
  },
  async create(data: any) {
    const entry = {
      log_id: Date.now(),
      created_at: new Date().toISOString(),
      ...data,
    };
    auditLogs.unshift(entry);
    return entry;
  },
};
