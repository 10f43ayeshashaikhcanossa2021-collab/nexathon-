
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import type {
  Organisation,
  BrandProfile,
  BrandGuideline,
  ApprovedFact,
  TerminologyItem,
  ContentSubmission,
  ContentVersion,
} from '../types/inkloom';

export interface SupabaseHealthReport {
  connected: boolean;
  status: 'connected' | 'unconfigured' | 'unreachable';
  latencyMs: number;
  error?: string;
  checkedAt: string;
}

const getEnvironment = (name: string): string | undefined => {
  if (typeof process === 'undefined') return undefined;
  return process.env[name];
};

class SupabaseService {
  private client: SupabaseClient | null = null;
  private initialized = false;

  getClient(): SupabaseClient | null {
    if (this.initialized) return this.client;

    this.initialized = true;

    const url = getEnvironment('SUPABASE_URL');
    const key = getEnvironment('SUPABASE_SERVICE_ROLE_KEY');

    if (!url || !key) {
      return null;
    }

    this.client = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    return this.client;
  }

  async checkHealth(): Promise<SupabaseHealthReport> {
    const checkedAt = new Date().toISOString();
    const client = this.getClient();

    if (!client) {
      return {
        connected: false,
        status: 'unconfigured',
        latencyMs: 0,
        error: 'Supabase server configuration is missing.',
        checkedAt,
      };
    }

    const start = Date.now();

    try {
      const { error } = await client
        .from('organisations')
        .select('org_id')
        .limit(1);

      if (error) {
        return {
          connected: false,
          status: 'unreachable',
          latencyMs: Date.now() - start,
          error: 'Database query failed. Check Supabase configuration and permissions.',
          checkedAt,
        };
      }

      return {
        connected: true,
        status: 'connected',
        latencyMs: Date.now() - start,
        checkedAt,
      };
    } catch {
      return {
        connected: false,
        status: 'unreachable',
        latencyMs: Date.now() - start,
        error: 'Unable to connect to Supabase.',
        checkedAt,
      };
    }
  }

  async syncBrandKnowledge(
    _org: Organisation,
    _profile: BrandProfile,
    _guidelines: BrandGuideline[],
    _facts: ApprovedFact[],
    _terms: TerminologyItem[]
  ): Promise<{ success: boolean; synced: number; error?: string }> {
    return {
      success: false,
      synced: 0,
      error: 'Brand knowledge synchronization has not been implemented yet.',
    };
  }

  async persistSubmission(
    _submission: ContentSubmission,
    _version: ContentVersion | undefined
  ): Promise<{ success: boolean; error?: string }> {
    return {
      success: false,
      error: 'Submission persistence has not been implemented yet.',
    };
  }
}

export const supabaseService = new SupabaseService();
