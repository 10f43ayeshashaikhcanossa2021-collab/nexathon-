import React, { useState, useEffect } from 'react';
import { User, ContentSubmission } from '../types/inkloom';
import { api } from '../api/client';
import { store } from '../services/store';
import {
  Sparkles,
  FileText,
  Inbox,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  BookOpen,
  Cpu,
  Layers,
} from 'lucide-react';

interface DashboardPageProps {
  currentUser: User;
  onNavigate: (page: string, params?: any) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ currentUser, onNavigate }) => {
  const [submissions, setSubmissions] = useState<ContentSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    setLoading(true);
    try {
      const subs = await api.getSubmissions();
      setSubmissions(subs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const pendingCorrection = submissions.filter((s) => s.status === 'in_correction').length;
  const inReviewCount = submissions.filter((s) => s.status === 'in_review').length;
  const approvedCount = submissions.filter((s) => s.status === 'approved').length;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-[#0B1B3A] via-[#162C5B] to-[#0D706B] rounded-3xl p-6 md:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Brand Governance • Reference-Grounded Engine</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-2">
            Welcome back, {currentUser.full_name.split(' ')[0]}
          </h1>
          <p className="text-sm text-slate-200 leading-relaxed">
            INKLOOM AI guards brand integrity by verifying draft content against 16 active brand guidelines,
            14 verified facts, and approved terminology before human managerial sign-off.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            <button
              type="button"
              onClick={() => onNavigate('submissions-new')}
              className="px-4 py-2.5 bg-[#139A93] hover:bg-[#0D706B] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Submit New Copy</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {(currentUser.role === 'reviewer' || currentUser.role === 'admin') && (
              <button
                type="button"
                onClick={() => onNavigate('review-queue')}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
              >
                <Inbox className="w-4 h-4" />
                <span>Review Queue ({inReviewCount})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#D5DBE5] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Total Submissions
            </div>
            <div className="text-2xl font-black text-[#0B1B3A] mt-1">{submissions.length}</div>
            <div className="text-[11px] text-teal-600 font-medium mt-1">Across 90 Days</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#D5DBE5] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              In Review Queue
            </div>
            <div className="text-2xl font-black text-teal-700 mt-1">{inReviewCount}</div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">Awaiting Reviewer Sign-off</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
            <Inbox className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#D5DBE5] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Approved Content
            </div>
            <div className="text-2xl font-black text-emerald-700 mt-1">{approvedCount}</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1">Verified & Published</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#D5DBE5] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Active Brand Rules
            </div>
            <div className="text-2xl font-black text-[#0B1B3A] mt-1">
              {store.guidelines.length + store.facts.length}
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">
              {store.guidelines.length} Rules • {store.facts.length} Facts
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Recent Submissions List */}
      <div className="bg-white border border-[#D5DBE5] rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#D5DBE5] flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#0B1B3A]">Recent Submissions</h3>
            <p className="text-xs text-slate-500">
              Latest content submitted for reference compliance checking.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('history')}
            className="text-xs text-[#139A93] hover:text-[#0D706B] font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {submissions.slice(0, 5).map((sub) => {
            const getStatusBadge = () => {
              switch (sub.status) {
                case 'approved':
                  return 'bg-emerald-50 text-emerald-700 border-emerald-200';
                case 'in_review':
                  return 'bg-teal-50 text-teal-800 border-teal-200';
                case 'changes_requested':
                  return 'bg-rose-50 text-rose-700 border-rose-200';
                case 'in_correction':
                  return 'bg-amber-50 text-amber-800 border-amber-200';
                default:
                  return 'bg-slate-50 text-slate-700 border-slate-200';
              }
            };

            return (
              <div
                key={sub.submission_id}
                onClick={() => onNavigate('results', { submissionId: sub.submission_id })}
                className="p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between cursor-pointer"
              >
                <div className="min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-xs text-[#0B1B3A] truncate">{sub.title}</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                      {sub.content_type}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    By {sub.creator_name || 'Creator'} •{' '}
                    {new Date(sub.created_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${getStatusBadge()}`}
                  >
                    {sub.status.replace('_', ' ')}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
