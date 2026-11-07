import React, { useState, useEffect } from 'react';
import { User } from '../types/inkloom';
import { api } from '../api/client';
import { Inbox, ArrowRight, ShieldCheck, Clock, AlertTriangle } from 'lucide-react';

interface ReviewQueuePageProps {
  currentUser: User;
  onNavigate: (page: string, params?: any) => void;
}

export const ReviewQueuePage: React.FC<ReviewQueuePageProps> = ({ currentUser, onNavigate }) => {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    setLoading(true);
    try {
      const data = await api.getReviewQueue();
      setQueue(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1B3A]">Reviewer Decision Queue</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Content submissions submitted by creators awaiting human managerial review and sign-off.
          </p>
        </div>
      </div>

      <div className="bg-white border border-[#D5DBE5] rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#D5DBE5] flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Inbox className="w-4 h-4 text-slate-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0B1B3A]">
              Pending Reviews ({queue.length})
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Sorted by highest unresolved severity, then submission age
          </span>
        </div>

        {queue.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No submissions currently awaiting review in the queue.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {queue.map((item) => (
              <div
                key={item.submission_id}
                onClick={() => onNavigate('approval', { versionId: item.version_id })}
                className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#0B1B3A]">{item.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-slate-100 text-slate-700 font-bold uppercase">
                      v{item.version_no}
                    </span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.2 rounded bg-teal-50 text-teal-800 font-semibold border border-teal-200">
                      {item.content_type}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 flex items-center gap-3">
                    <span>Creator: <strong className="text-slate-700">{item.creator_name}</strong></span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.updated_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="flex items-center gap-2">
                    {item.unresolved_high > 0 ? (
                      <span className="px-2.5 py-1 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        {item.unresolved_high} High
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Clean High
                      </span>
                    )}
                    <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">
                      {item.unresolved_medium} Med
                    </span>
                  </div>

                  <button
                    type="button"
                    className="px-4 py-2 bg-[#0B1B3A] hover:bg-[#162C5B] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <span>Open Station</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
