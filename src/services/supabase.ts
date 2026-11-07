/**
 * INKLOOM AI - Supabase Cloud Database Client & Persistence Service
 * Connects to project: https://slsqtsnlsdxwbhfazbax.supabase.co
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Organisation,
  User,
  BrandProfile,
  BrandGuideline,
  ApprovedFact,
  TerminologyItem,
  ContentSubmission,
  ContentVersion,
  ReviewComment,
  ApprovalRecord,
  AuditLog,
  PublishJob,
  SocialAccount,
} from '../types/inkloom';

// Supabase Project Credentials
export const SUPABASE_URL =
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.SUPABASE_URL) ||
  'https://slsqtsnlsdxwbhfazbax.supabase.co';

export const SUPABASE_ANON_KEY =
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
  (typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY) ||
  'sb_publishable_nfxaRi9SxX7V2VzuSR9swg_wCAdS-Pa';

export interface SupabaseHealthReport {
  connected: boolean;
  projectUrl: string;
  latencyMs: number;
  tablesVerified: string[];
  status: 'operational' | 'degraded' | 'unreachable';
  timestamp: string;
  error?: string;
}

class SupabaseService {
  private client: SupabaseClient | null = null;

  constructor() {
    this.initClient();
  }

  private initClient() {
    try {
      this.client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
    }
  }

  public getClient(): SupabaseClient | null {
    if (!this.client) {
      this.initClient();
    }
    return this.client;
  }

  /**
   * Health and latency probe for Supabase PostgreSQL instance
   */
  public async checkHealth(): Promise<SupabaseHealthReport> {
    const start = Date.now();
    const verified: string[] = [];

    if (!this.client) {
      return {
        connected: false,
        projectUrl: SUPABASE_URL,
        latencyMs: 0,
        tablesVerified: [],
        status: 'unreachable',
        timestamp: new Date().toISOString(),
        error: 'Client not initialized',
      };
    }

    try {
      // Probe organisations table
      const { data, error, status } = await this.client
        .from('organisations')
        .select('org_id')
        .limit(1);

      const latencyMs = Date.now() - start;

      if (error && status !== 200 && status !== 204) {
        return {
          connected: false,
          projectUrl: SUPABASE_URL,
          latencyMs,
          tablesVerified: [],
          status: 'degraded',
          timestamp: new Date().toISOString(),
          error: error.message,
        };
      }

      verified.push('organisations');

      // Check key tables
      const checkTables = [
        'users',
        'brand_profiles',
        'brand_guidelines',
        'approved_facts',
        'content_submissions',
        'content_versions',
        'review_comments',
        'approval_records',
        'audit_logs',
        'social_accounts',
        'publish_jobs',
      ];

      for (const t of checkTables) {
        try {
          const res = await this.client.from(t).select('*', { count: 'exact', head: true });
          if (res.status === 200 || res.status === 204) {
            verified.push(t);
          }
        } catch {
          // ignore individual table check failures
        }
      }

      return {
        connected: true,
        projectUrl: SUPABASE_URL,
        latencyMs,
        tablesVerified: verified,
        status: 'operational',
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        connected: false,
        projectUrl: SUPABASE_URL,
        latencyMs: Date.now() - start,
        tablesVerified: [],
        status: 'unreachable',
        timestamp: new Date().toISOString(),
        error: err.message || 'Network error reaching Supabase',
      };
    }
  }

  /**
   * Syncs brand guidelines, approved facts, terminology, and seed organizations to Supabase
   */
  public async syncBrandKnowledge(
    org: Organisation,
    profile: BrandProfile,
    guidelines: BrandGuideline[],
    facts: ApprovedFact[],
    terms: TerminologyItem[]
  ): Promise<{ synced: number; error?: string }> {
    if (!this.client) return { synced: 0, error: 'No client' };

    let count = 0;
    try {
      // 1. Sync Organisation
      await this.client.from('organisations').upsert(
        {
          org_id: org.org_id,
          name: org.name,
          domain: org.domain,
          created_at: org.created_at,
        },
        { onConflict: 'org_id' }
      );
      count++;

      // 2. Sync Profile
      await this.client.from('brand_profiles').upsert(
        {
          profile_id: profile.profile_id,
          org_id: org.org_id,
          name: profile.name,
          voice_notes: profile.voice_notes,
          status: profile.status,
          external_ai_allowed: profile.external_ai_allowed,
          team_visibility: profile.team_visibility,
          palette: (profile as any).palette || [],
          created_at: profile.created_at,
        },
        { onConflict: 'profile_id' }
      );
      count++;

      // 3. Sync Guidelines
      for (const g of guidelines) {
        await this.client.from('brand_guidelines').upsert(
          {
            guideline_id: g.guideline_id,
            profile_id: g.profile_id,
            code: g.code,
            title: g.title,
            category: g.category,
            rule_text: g.rule_text,
            content_types: g.content_types,
            example_good: g.example_good,
            example_bad: g.example_bad,
            version: g.version,
            is_active: g.is_active,
            created_at: g.created_at,
          },
          { onConflict: 'guideline_id' }
        );
        count++;
      }

      // 4. Sync Approved Facts
      for (const f of facts) {
        await this.client.from('approved_facts').upsert(
          {
            fact_id: f.fact_id,
            profile_id: f.profile_id,
            code: f.code,
            statement: f.statement,
            subject: f.subject,
            source_ref: f.source_ref,
            valid_until: f.valid_until,
            is_active: f.is_active,
            created_at: f.created_at,
          },
          { onConflict: 'fact_id' }
        );
        count++;
      }

      // 5. Sync Terminology
      for (const t of terms) {
        await this.client.from('terminology').upsert(
          {
            term_id: t.term_id,
            profile_id: t.profile_id,
            code: t.code,
            preferred_term: t.preferred_term,
            avoid_terms: t.avoid_terms,
            notes: t.notes,
            case_sensitive: t.case_sensitive,
          },
          { onConflict: 'term_id' }
        );
        count++;
      }

      return { synced: count };
    } catch (err: any) {
      console.error('Error syncing brand knowledge to Supabase:', err);
      return { synced: count, error: err.message };
    }
  }

  /**
   * Persist a submission to Supabase
   */
  public async persistSubmission(
    submission: ContentSubmission,
    version?: ContentVersion
  ): Promise<boolean> {
    if (!this.client) return false;
    try {
      await this.client.from('content_submissions').upsert(
        {
          submission_id: submission.submission_id,
          profile_id: submission.profile_id,
          creator_id: submission.creator_id,
          title: submission.title,
          content_type: submission.content_type,
          status: submission.status,
          created_at: submission.created_at,
          updated_at: submission.updated_at,
        },
        { onConflict: 'submission_id' }
      );

      if (version) {
        await this.client.from('content_versions').upsert(
          {
            version_id: version.version_id,
            submission_id: version.submission_id,
            version_no: version.version_no,
            body_text: version.body_text,
            media: version.media,
            links: version.links,
            source: version.source,
            created_by: version.created_by,
            created_at: version.created_at,
          },
          { onConflict: 'version_id' }
        );
      }
      return true;
    } catch (err) {
      console.error('Failed to persist submission in Supabase:', err);
      return false;
    }
  }

  /**
   * Persist a comment in Supabase
   */
  public async persistComment(comment: ReviewComment): Promise<boolean> {
    if (!this.client) return false;
    try {
      await this.client.from('review_comments').insert({
        comment_id: comment.comment_id,
        version_id: comment.version_id,
        author_id: comment.author_id,
        issue_id: comment.issue_id || null,
        parent_comment_id: comment.parent_comment_id || null,
        body: comment.body,
        created_at: comment.created_at,
      });
      return true;
    } catch (err) {
      console.error('Failed to persist comment in Supabase:', err);
      return false;
    }
  }

  /**
   * Persist an approval decision in Supabase
   */
  public async persistApproval(approval: ApprovalRecord): Promise<boolean> {
    if (!this.client) return false;
    try {
      await this.client.from('approval_records').insert({
        approval_id: approval.approval_id,
        version_id: approval.version_id,
        reviewer_id: approval.reviewer_id,
        decision: approval.decision,
        comment: approval.comment || null,
        decided_at: approval.decided_at,
      });
      return true;
    } catch (err) {
      console.error('Failed to persist approval in Supabase:', err);
      return false;
    }
  }

  /**
   * Persist an audit log entry in Supabase
   */
  public async persistAuditLog(log: AuditLog): Promise<boolean> {
    if (!this.client) return false;
    try {
      await this.client.from('audit_logs').insert({
        org_id: log.org_id,
        actor_id: log.actor_id,
        action: log.action,
        entity_type: log.entity_type,
        entity_id: log.entity_id || null,
        metadata: log.metadata || {},
        created_at: log.created_at,
      });
      return true;
    } catch (err) {
      console.error('Failed to persist audit log in Supabase:', err);
      return false;
    }
  }
}

export const supabaseService = new SupabaseService();
export const supabase = supabaseService.getClient();
