import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileCheck2,
  ArrowRight,
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const summary = await api.getAnalyticsSummary();
      setData(summary);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!data) {
    return <div className="p-8 text-center text-slate-500">Loading governance metrics...</div>;
  }

  const { metrics, categoryMix, severityMix, unclearRules, topTriggeredRules } = data;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1B3A]">Brand Governance Analytics</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time compliance intelligence, approval efficiency, and policy ambiguity diagnostics.
        </p>
      </div>

      {/* Top 5 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#D5DBE5] shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Submissions
          </div>
          <div className="text-2xl font-black text-[#0B1B3A] mt-1">{metrics.totalSubmissions}</div>
          <div className="text-[11px] text-teal-600 font-medium mt-1">90-Day Volume</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#D5DBE5] shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Approval Rate
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{metrics.approvalRate}%</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Finalized Content</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#D5DBE5] shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Avg Revisions
          </div>
          <div className="text-2xl font-black text-[#0B1B3A] mt-1">{metrics.avgRevisions}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Per Approved Draft</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#D5DBE5] shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Clean Draft Rate
          </div>
          <div className="text-2xl font-black text-teal-700 mt-1">{metrics.cleanDraftRate}%</div>
          <div className="text-[11px] text-teal-600 font-medium mt-1">Zero High Conflicts</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#D5DBE5] shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            AI-Unavailable Runs
          </div>
          <div className="text-2xl font-black text-slate-700 mt-1">{metrics.aiUnavailableRuns}</div>
          <div className="text-[11px] text-slate-400 font-medium mt-1">Fallback Activated</div>
        </div>
      </div>

      {/* Grid: Category Mix & Severity Mix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-[#D5DBE5] shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#0B1B3A]">Issues by Category</h3>
          <div className="space-y-3">
            {Object.entries(categoryMix).map(([cat, count]: [string, any]) => (
              <div key={cat} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="capitalize text-slate-700">{cat.replace('_', ' ')}</span>
                  <span className="font-mono text-slate-900">{count} findings</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#139A93] rounded-full"
                    style={{ width: `${Math.min(100, (count / 25) * 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Severity Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-[#D5DBE5] shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#0B1B3A]">Severity Grading Mix</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-center">
              <div className="text-2xl font-black text-rose-800">{severityMix.high}</div>
              <div className="text-xs font-bold uppercase text-rose-700 mt-1">High Severity</div>
              <div className="text-[10px] text-rose-600 mt-0.5">Verified Conflicts</div>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-center">
              <div className="text-2xl font-black text-amber-800">{severityMix.medium}</div>
              <div className="text-xs font-bold uppercase text-amber-700 mt-1">Medium Severity</div>
              <div className="text-[10px] text-amber-600 mt-0.5">Uncovered Claims</div>
            </div>

            <div className="bg-slate-100 border border-slate-200 p-4 rounded-xl text-center">
              <div className="text-2xl font-black text-slate-800">{severityMix.low}</div>
              <div className="text-xs font-bold uppercase text-slate-700 mt-1">Low Severity</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Tone & Terms</div>
            </div>
          </div>
        </div>
      </div>

      {/* Unclear Rules Diagnostic Section (Part F.14) */}
      <div className="bg-white border border-[#D5DBE5] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-amber-600" />
          <div>
            <h3 className="text-sm font-bold text-[#0B1B3A]">
              Rules That May Be Unclear (High Trigger + Dismiss Rate ≥ 45%)
            </h3>
            <p className="text-xs text-slate-500">
              Guidelines that writers frequently dismiss with justifications, signaling need for policy revision.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {unclearRules.map((r: any) => (
            <div
              key={r.code}
              className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-amber-300 text-amber-900">
                    {r.code}
                  </span>
                  <span className="font-bold text-[#0B1B3A]">{r.title}</span>
                </div>
                <span className="font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                  {r.dismissRate}% Dismissal Rate
                </span>
              </div>

              <div className="text-slate-600 flex items-center gap-4 text-[11px]">
                <span>Total triggers: {r.triggers}</span>
                <span>•</span>
                <span>Dismissals: {r.dismissals}</span>
              </div>

              {r.topReasons?.length > 0 && (
                <div className="pt-2 border-t border-amber-200/60 text-[11px] text-slate-700">
                  <strong className="text-amber-900">Top creator justifications: </strong>
                  {r.topReasons.map((reason: string, i: number) => (
                    <span key={i} className="italic">
                      "{reason}"{i < r.topReasons.length - 1 ? '; ' : ''}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
