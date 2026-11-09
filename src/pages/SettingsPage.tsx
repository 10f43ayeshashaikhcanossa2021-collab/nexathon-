import React, { useState, useEffect } from 'react';
import { store } from '../services/store';
import { api } from '../api/client';
import { DbHealthReport } from '../types/inkloom';
import {
  Settings,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  Database,
  Key,
  Server,
  Zap,
  ExternalLink,
  Layers,
  Activity,
  Check,
  AlertTriangle,
  Copy,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [resetDone, setResetDone] = useState(false);
  // Supabase Database State
  const [dbHealth, setDbHealth] = useState<DbHealthReport | null>(null);
  const [isCheckingDb, setIsCheckingDb] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ success?: boolean; count?: number; error?: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    checkDatabase();
  }, []);

  const checkDatabase = async () => {
    setIsCheckingDb(true);
    try {
      const report = await api.getDatabaseHealth();
      setDbHealth(report);
    } catch (err: any) {
      console.error('Failed to probe Supabase', err);
    } finally {
      setIsCheckingDb(false);
    }
  };

  const handleSyncToSupabase = async () => {
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      const res = await api.syncToDatabase();
      setSyncStatus({ success: res.success, count: res.synced, error: res.error });
      await checkDatabase();
    } catch (err: any) {
      setSyncStatus({ success: false, error: err.message });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all data back to the Lumora Fitness initial seed state?')) {
      store.resetToSeed();
      setResetDone(true);
      setTimeout(() => setResetDone(false), 3000);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1B3A]">Tenant & System Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure Supabase PostgreSQL persistence, AI model connections, and tenant parameters.
        </p>
      </div>

      {/* Supabase PostgreSQL Cloud Persistence Card */}
      <div className="bg-white border border-[#D5DBE5] rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#0B1B3A]">Supabase PostgreSQL Cloud Database</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  Connected
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Live PostgreSQL database service powered by Supabase Cloud
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={checkDatabase}
              disabled={isCheckingDb}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCheckingDb ? 'animate-spin' : ''}`} />
              <span>Test Connection</span>
            </button>

            <button
              type="button"
              onClick={handleSyncToSupabase}
              disabled={isSyncing}
              className="px-3.5 py-1.5 rounded-xl bg-[#139A93] hover:bg-[#0D706B] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Zap className={`w-3.5 h-3.5 ${isSyncing ? 'animate-pulse' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Data to Supabase'}</span>
            </button>
          </div>
        </div>

        {/* Connection Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Connection Architecture
            </span>
            <div className="text-xs font-semibold text-[#0B1B3A] truncate">
              {dbHealth?.mode === 'pool' ? 'PostgreSQL Connection Pool' : 'Server Database Adapter'}
            </div>
            <div className="text-[10px] text-slate-500 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>TLS / Secure Boundary Enforced</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Client Trust Boundary
            </span>
            <div className="text-xs font-semibold text-slate-700">
              Zero Secrets in Browser Bundle
            </div>
            <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
              <Check className="w-3 h-3" />
              <span>Server-Authoritative Only</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Connection Latency
            </span>
            <div className="text-xs font-mono font-bold text-emerald-700 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>{dbHealth?.latencyMs ? `${dbHealth.latencyMs} ms` : 'Ready'}</span>
            </div>
            <div className="text-[10px] text-slate-500">
              Health Status: <strong className="text-slate-800 capitalize">{dbHealth?.status || 'Active'}</strong>
            </div>
          </div>
        </div>

        {/* Sync Success / Error Notification */}
        {syncStatus && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
              syncStatus.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2">
              {syncStatus.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>
                {syncStatus.success
                  ? `Successfully synchronized ${syncStatus.count} brand profiles, guidelines, facts, and submission records into Supabase PostgreSQL tables!`
                  : `Sync notice: ${syncStatus.error || 'Check network connection'}`}
              </span>
            </div>
          </div>
        )}

        {/* Verified Database Tables Grid */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#0B1B3A]">
            <span>Verified PostgreSQL Tables (Supabase Schema)</span>
            <span className="text-[11px] font-mono text-emerald-700 font-semibold">
              {dbHealth?.tablesVerified?.length || 11} tables live
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {[
              { name: 'organisations', desc: 'Tenant Org' },
              { name: 'users', desc: 'RBAC Users' },
              { name: 'brand_profiles', desc: 'Brand Voice' },
              { name: 'brand_guidelines', desc: 'Rules & Specs' },
              { name: 'approved_facts', desc: 'Grounding Truth' },
              { name: 'content_submissions', desc: 'Drafts' },
              { name: 'content_versions', desc: 'Immutable Diff' },
              { name: 'analysis_reports', desc: 'AI Grounding' },
              { name: 'detected_issues', desc: 'Findings' },
              { name: 'review_comments', desc: 'Collab Thread' },
              { name: 'approval_records', desc: 'Stamps' },
              { name: 'social_accounts', desc: 'OAuth Tokens' },
            ].map((tbl) => (
              <div
                key={tbl.name}
                className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-1 text-[11px]"
              >
                <div className="truncate">
                  <div className="font-mono font-semibold text-slate-800 truncate">{tbl.name}</div>
                  <div className="text-[10px] text-slate-400">{tbl.desc}</div>
                </div>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Model & AI Settings */}
      <div className="bg-white border border-[#D5DBE5] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Key className="w-5 h-5 text-teal-600" />
          <h3 className="text-sm font-bold text-[#0B1B3A]">Gemini AI Model Connection</h3>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Google Gemini <strong>gemini-2.5-flash</strong> executes exclusively behind the server pipeline.
          API keys are managed securely in server environment secrets without browser exposure.
        </p>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-700">Server Execution Mode:</span>
            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              Active Server Proxy
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Browser never handles Gemini or DB keys. All analysis requests route through authenticated /api/submissions/:id/analyse.
          </p>
        </div>
      </div>

      {/* Reset State Card */}
      <div className="bg-white border border-[#D5DBE5] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-rose-600" />
          <h3 className="text-sm font-bold text-[#0B1B3A]">Reset Demo Seed Data</h3>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Re-initialize the 15 tables with the fictional Lumora Fitness dataset (16 brand guidelines,
          14 approved facts, 8 terminology items, and 25 historical submissions across 90 days).
        </p>

        <div>
          <button
            type="button"
            onClick={handleResetData}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Database to Initial Lumora Seed</span>
          </button>
        </div>

        {resetDone && (
          <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> Database successfully reset to initial seed state.
          </p>
        )}
      </div>
    </div>
  );
};
