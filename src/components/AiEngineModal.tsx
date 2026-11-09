import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Cpu,
  ShieldCheck,
  Key,
  CheckCircle2,
  RefreshCw,
  Sliders,
  HelpCircle,
  Database,
} from 'lucide-react';

interface AiEngineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiEngineModal: React.FC<AiEngineModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#D5DBE5] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#D5DBE5] flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#139A93]" />
            <div>
              <h3 className="text-base font-bold text-[#0B1B3A]">
                AI Intelligence & Verification Architecture
              </h3>
              <p className="text-xs text-slate-500">
                Gemini 3.8 Flash + Reference-Grounded Policy Pipeline
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Active Model Status Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#0B1B3A] to-[#162C5B] text-white flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs uppercase font-bold tracking-wider text-teal-300">
                  Active Model
                </span>
              </div>
              <h4 className="text-lg font-black mt-0.5">gemini-3.8-flash</h4>
              <p className="text-xs text-slate-300 mt-1 max-w-md">
                Reference-grounded analysis comparing submitted text strictly against active guidelines,
                verified facts, and vocabulary dictionaries.
              </p>
            </div>
            <div className="text-right">
              <span className="px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 text-xs font-semibold">
                Online & Reactive
              </span>
            </div>
          </div>

          {/* Dynamic Analysis Explanation */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-[#0B1B3A]">
              How it Analyzes Different Data
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0B1B3A]">
                  <Database className="w-4 h-4 text-teal-600" />
                  <span>1. Reference Retrieval</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Extracts tokens from your draft and retrieves matching active guidelines, unexpired facts,
                  and vocabulary terms from the tenant profile.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0B1B3A]">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span>2. Grounded Reasoning</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Evaluates copy against references. Extracts numbers, durations, pricing, and terms. Flags
                  unsubstantiated claims and contradictions.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0B1B3A]">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span>3. Verbatim Validation</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enforces that all excerpt spans exist verbatim in the draft, computes start/end offsets, and
                  filters out uncited model hallucinations.
                </p>
              </div>
            </div>
          </div>

          {/* Server-Side AI Security Notice */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-[#139A93]" />
                <h5 className="text-xs font-bold uppercase tracking-wider text-[#0B1B3A]">
                  Server-Side AI Security & Trust Boundary
                </h5>
              </div>
              <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                Server Proxy Only
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              In accordance with enterprise trust boundary standards, the browser client never holds or transmits Gemini API keys.
              All analysis pipeline executions run authoritatively on the backend server.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#D5DBE5] bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Tenant: Lumora Master Brand Voice (Enterprise Active Profile)
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
