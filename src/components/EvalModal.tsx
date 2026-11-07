import React, { useState } from 'react';
import { api } from '../api/client';
import { X, Play, CheckCircle2, XCircle, Sparkles, Loader2 } from 'lucide-react';

interface EvalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EvalModal: React.FC<EvalModalProps> = ({ isOpen, onClose }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleRunEval = async () => {
    setIsRunning(true);
    try {
      const res = await api.runBenchmarkEval();
      setResults(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#D5DBE5] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#D5DBE5] flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#139A93]" />
            <div>
              <h3 className="text-base font-bold text-[#0B1B3A]">
                Labelled Test Set Evaluator (Part F.15)
              </h3>
              <p className="text-xs text-slate-500">
                Automated regression testing of reference test cases TS-01 through TS-08.
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
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="bg-[#FBFAF7] border border-[#E8E4DC] p-4 rounded-xl flex items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B1B3A]">
                Regression Benchmark Suite
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Evaluates exact category matching, severity grading, and code citations across known scenarios.
              </p>
            </div>
            <button
              type="button"
              onClick={handleRunEval}
              disabled={isRunning}
              className="px-4 py-2 bg-[#139A93] hover:bg-[#0D706B] text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Running Benchmark...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Execute 8 Test Cases</span>
                </>
              )}
            </button>
          </div>

          {results && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white border border-[#D5DBE5] p-3 rounded-xl text-center">
                  <div className="text-2xl font-black text-[#0B1B3A]">{results.total}</div>
                  <div className="text-[11px] text-slate-400 font-semibold uppercase">Total Cases</div>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-center">
                  <div className="text-2xl font-black text-emerald-700">{results.passedCount}</div>
                  <div className="text-[11px] text-emerald-600 font-semibold uppercase">Passed</div>
                </div>
                <div className="bg-teal-50 border border-teal-200 p-3 rounded-xl text-center">
                  <div className="text-2xl font-black text-teal-700">{results.accuracyRate}%</div>
                  <div className="text-[11px] text-teal-600 font-semibold uppercase">Accuracy Rate</div>
                </div>
              </div>

              <div className="space-y-2.5">
                {results.testCases.map((tc: any) => (
                  <div
                    key={tc.id}
                    className={`p-3 rounded-xl border transition-all text-xs ${
                      tc.passed
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : 'bg-rose-50/50 border-rose-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 font-mono font-bold">
                        <span className="text-[#0B1B3A]">{tc.id}</span>
                        {tc.passed ? (
                          <span className="flex items-center gap-1 text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                            <CheckCircle2 className="w-3 h-3" /> PASS
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-rose-700 bg-rose-100 px-2 py-0.5 rounded text-[10px]">
                            <XCircle className="w-3 h-3" /> FAIL
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500">{tc.notes}</span>
                    </div>

                    <p className="font-serif text-slate-800 text-sm mb-2 bg-white/80 p-2 rounded border border-slate-200">
                      "{tc.draft}"
                    </p>

                    <div className="text-[11px] text-slate-600 flex items-center justify-between border-t border-slate-200/60 pt-1.5">
                      <span>Expected findings: {tc.expectedCount}</span>
                      <span>Detected findings: {tc.actualCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#D5DBE5] bg-slate-50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
