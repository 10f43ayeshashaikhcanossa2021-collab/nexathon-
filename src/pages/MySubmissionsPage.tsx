import React, { useState, useEffect } from 'react';
import { User, ContentSubmission } from '../types/inkloom';
import { api } from '../api/client';
import { store } from '../services/store';
import {
  Inbox,
  Search,
  Filter,
  FilePlus,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';

interface MySubmissionsPageProps {
  currentUser: User;
  onNavigate: (page: string, params?: any) => void;
}

export const MySubmissionsPage: React.FC<MySubmissionsPageProps> = ({
  currentUser,
  onNavigate,
}) => {
  const [submissions, setSubmissions] = useState<ContentSubmission[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubmissions();
  }, [currentUser]);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const list = await api.getSubmissions();
      setSubmissions(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = submissions.filter((sub) => {
    if (statusFilter !== 'all' && sub.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!sub.title.toLowerCase().includes(q) && !(sub.creator_name || '').toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">APPROVED</span>;
      case 'in_review':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">IN REVIEW</span>;
      case 'changes_requested':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">CHANGES REQUESTED</span>;
      case 'in_correction':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">IN CORRECTION</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">DRAFT</span>;
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-bold text-[#139A93] tracking-wider">
              Submissions Index
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#0B1B3A]">
            {currentUser.role === 'creator' ? 'My Content Submissions' : 'All Organisation Submissions'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track draft iterations, correction progress, reviewer decisions, and publications.
          </p>
        </div>

        {currentUser.role === 'creator' && (
          <button
            type="button"
            onClick={() => onNavigate('submission')}
            className="px-3.5 py-2 rounded-xl bg-[#139A93] hover:bg-[#0d706b] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <FilePlus className="w-4 h-4" />
            <span>New Draft</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-[#D5DBE5]">
        <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search submission title or creator..."
            className="w-full bg-transparent focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="in_correction">In Correction</option>
            <option value="in_review">In Review</option>
            <option value="changes_requested">Changes Requested</option>
            <option value="approved">Approved</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-2xl border border-[#D5DBE5] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading submissions...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Inbox className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-semibold text-slate-700">No submissions found</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Submission Title</th>
                <th className="p-3.5 w-32">Type</th>
                <th className="p-3.5 w-36">Creator</th>
                <th className="p-3.5 w-36">Status</th>
                <th className="p-3.5 w-32">Date</th>
                <th className="p-3.5 w-24 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((sub) => (
                <tr
                  key={sub.submission_id}
                  onClick={() => {
                    if (sub.status === 'in_review') {
                      onNavigate('approval', { submissionId: sub.submission_id });
                    } else {
                      onNavigate('results', { submissionId: sub.submission_id });
                    }
                  }}
                  className="hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <td className="p-3.5">
                    <div className="font-semibold text-slate-900 group-hover:text-[#139A93] transition-colors">
                      {sub.title}
                    </div>
                  </td>
                  <td className="p-3.5 text-slate-600 capitalize">
                    {sub.content_type.replace('_', ' ')}
                  </td>
                  <td className="p-3.5 text-slate-700 font-medium">
                    {sub.creator_name || 'Ishaan Verma'}
                  </td>
                  <td className="p-3.5">{getStatusBadge(sub.status)}</td>
                  <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                    {new Date(sub.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-3.5 text-right">
                    <span className="inline-flex items-center gap-1 text-[#139A93] font-semibold group-hover:underline">
                      <span>Open</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
