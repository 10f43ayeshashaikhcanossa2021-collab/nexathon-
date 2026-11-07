import React, { useState, useEffect } from 'react';
import { User, ContentSubmission } from '../types/inkloom';
import { api } from '../api/client';
import { Search, Filter, Clock, ArrowRight, CheckCircle2, AlertTriangle, FileText, Share2 } from 'lucide-react';

interface HistoryPageProps {
  currentUser: User;
  onNavigate: (page: string, params?: any) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ currentUser, onNavigate }) => {
  const [submissions, setSubmissions] = useState<ContentSubmission[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadSubmissions();
  }, [currentUser]);

  const loadSubmissions = async () => {
    try {
      const list = await api.getSubmissions();
      setSubmissions(list);
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = submissions.filter((s) => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        s.title.toLowerCase().includes(q) ||
        (s.creator_name && s.creator_name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1B3A]">Submission History & Archive</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete audit trail of all content drafts, revisions, and approval records across 90 days.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title or creator..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-[#D5DBE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs p-1.5 bg-white border border-[#D5DBE5] rounded-xl focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="in_review">In Review</option>
            <option value="in_correction">In Correction</option>
            <option value="changes_requested">Changes Requested</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#D5DBE5] rounded-2xl shadow-xs overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filtered.map((sub) => {
            const getStatusBadge = () => {
              switch (sub.status) {
                case 'approved':
                  return 'bg-emerald-50 text-emerald-800 border-emerald-200';
                case 'in_review':
                  return 'bg-teal-50 text-teal-800 border-teal-200';
                case 'changes_requested':
                  return 'bg-rose-50 text-rose-800 border-rose-200';
                case 'in_correction':
                  return 'bg-amber-50 text-amber-800 border-amber-200';
                default:
                  return 'bg-slate-100 text-slate-700 border-slate-200';
              }
            };

            return (
              <div
                key={sub.submission_id}
                onClick={() => onNavigate('results', { submissionId: sub.submission_id })}
                className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#0B1B3A]">{sub.title}</span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.2 rounded bg-slate-100 text-slate-600">
                      {sub.content_type}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 flex items-center gap-3">
                    <span>Creator: <strong>{sub.creator_name || 'Creator'}</strong></span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(sub.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  {sub.status === 'approved' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('social-publishing', { submissionId: sub.submission_id });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Broadcast to Social Media"
                    >
                      <Share2 className="w-3.5 h-3.5 text-teal-600" />
                      <span className="hidden sm:inline">Broadcast</span>
                    </button>
                  )}
                  <span
                    className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full border ${getStatusBadge()}`}
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
