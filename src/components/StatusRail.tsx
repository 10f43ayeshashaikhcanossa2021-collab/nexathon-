import React from 'react';
import { SubmissionStatus } from '../types/inkloom';
import { CheckCircle2, Clock, AlertTriangle, ArrowRight, ShieldCheck, XCircle } from 'lucide-react';

interface StatusRailProps {
  status: SubmissionStatus;
  highUnresolved?: number;
}

export const StatusRail: React.FC<StatusRailProps> = ({ status, highUnresolved = 0 }) => {
  const steps: { key: SubmissionStatus; label: string; desc: string }[] = [
    { key: 'draft', label: '1. Draft', desc: 'Creator workspace' },
    { key: 'in_analysis', label: '2. Analysis', desc: 'Reference-grounded AI' },
    { key: 'in_correction', label: '3. Correction', desc: 'Review & adjust findings' },
    { key: 'in_review', label: '4. Review Queue', desc: 'Manager verification' },
    { key: 'approved', label: '5. Decision', desc: 'Approved or changes requested' },
  ];

  const getStepState = (stepKey: SubmissionStatus) => {
    const order: Record<SubmissionStatus, number> = {
      draft: 0,
      in_analysis: 1,
      in_correction: 2,
      in_review: 3,
      approved: 4,
      changes_requested: 4,
    };

    const currentIdx = order[status] ?? 0;
    const stepIdx = order[stepKey] ?? 0;

    if (stepIdx < currentIdx) return 'completed';
    if (stepIdx === currentIdx) return 'current';
    return 'upcoming';
  };

  return (
    <div className="bg-white border border-[#D5DBE5] rounded-2xl p-4 shadow-xs">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {steps.map((step, idx) => {
          const state = getStepState(step.key);
          const isLast = idx === steps.length - 1;

          return (
            <React.Fragment key={step.key}>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all shrink-0 ${
                    state === 'completed'
                      ? 'bg-[#139A93] text-white'
                      : state === 'current'
                      ? status === 'changes_requested'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'bg-[#0B1B3A] text-white shadow-sm ring-2 ring-teal-400/40 ring-offset-2'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {state === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : status === 'changes_requested' && isLast ? (
                    <XCircle className="w-5 h-5" />
                  ) : (
                    idx + 1
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider ${
                        state === 'current'
                          ? 'text-[#0B1B3A]'
                          : state === 'completed'
                          ? 'text-[#139A93]'
                          : 'text-slate-400'
                      }`}
                    >
                      {isLast && status === 'changes_requested'
                        ? '5. Changes Requested'
                        : isLast && status === 'approved'
                        ? '5. Approved'
                        : step.label}
                    </span>
                    {state === 'current' && highUnresolved > 0 && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-100 text-rose-700 font-semibold border border-rose-200">
                        {highUnresolved} High Unresolved
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">{step.desc}</p>
                </div>
              </div>

              {!isLast && (
                <div className="hidden md:flex items-center justify-center text-slate-300">
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
