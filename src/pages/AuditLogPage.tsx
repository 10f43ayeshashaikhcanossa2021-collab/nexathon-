import React, { useState, useEffect } from 'react';
import { AuditLog } from '../types/inkloom';
import { store } from '../services/store';
import { Shield, Clock, Search } from 'lucide-react';

export const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>(store.getAuditLogs());
  const [query, setQuery] = useState('');

  const filtered = logs.filter((l) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      l.action.toLowerCase().includes(q) ||
      l.actor_name.toLowerCase().includes(q) ||
      l.entity_type.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1B3A]">Immutable Audit Trail</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Comprehensive compliance log recording every action, submission, review decision, and rule update.
        </p>
      </div>

      <div className="bg-white border border-[#D5DBE5] rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#D5DBE5] bg-slate-50 flex items-center justify-between">
          <input
            type="text"
            placeholder="Search audit actions, actors, or entity types..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full sm:w-80 text-xs p-2 bg-white border border-slate-300 rounded-xl"
          />
          <span className="text-xs text-slate-400 font-mono">{filtered.length} Recorded Events</span>
        </div>

        <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
          {filtered.map((log) => (
            <div key={log.log_id} className="p-4 hover:bg-slate-50/60 transition-colors text-xs flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-[#0B1B3A]">{log.action}</span>
                  <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-slate-100 text-slate-600">
                    {log.entity_type}
                  </span>
                </div>
                <div className="text-slate-500 text-[11px]">
                  Actor: <strong className="text-slate-700">{log.actor_name}</strong>
                </div>
              </div>

              <div className="text-right text-[11px] text-slate-400 font-mono shrink-0">
                {new Date(log.created_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
