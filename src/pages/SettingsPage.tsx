import React, { useState } from 'react';
import { store } from '../services/store';
import { api } from '../api/client';
import { Settings, RefreshCw, CheckCircle2, ShieldCheck, Database, Key } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [resetDone, setResetDone] = useState(false);
  const [geminiKey, setGeminiKey] = useState(
    typeof window !== 'undefined' ? localStorage.getItem('inkloom_gemini_key') || '' : ''
  );
  const [keySaved, setKeySaved] = useState(false);

  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all data back to the Lumora Fitness initial seed state?')) {
      store.resetToSeed();
      setResetDone(true);
      setTimeout(() => setResetDone(false), 3000);
    }
  };

  const handleSaveKey = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('inkloom_gemini_key', geminiKey.trim());
      setKeySaved(true);
      setTimeout(() => setKeySaved(false), 2500);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1B3A]">Tenant & System Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure model connections, tenant parameters, and database state.
        </p>
      </div>

      {/* Model & AI Settings */}
      <div className="bg-white border border-[#D5DBE5] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Key className="w-5 h-5 text-teal-600" />
          <h3 className="text-sm font-bold text-[#0B1B3A]">Gemini AI Model Connection</h3>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          INKLOOM AI uses Google Gemini <strong>gemini-3.8-flash</strong> for live grounded reasoning.
          Enter your Gemini API key below to test direct real-time model completions:
        </p>

        <div className="flex items-center gap-2">
          <input
            type="password"
            placeholder="AIzaSy..."
            value={geminiKey}
            onChange={(e) => setGeminiKey(e.target.value)}
            className="flex-1 text-xs font-mono p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
          />
          <button
            type="button"
            onClick={handleSaveKey}
            className="px-4 py-2.5 bg-[#139A93] hover:bg-[#0D706B] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Save Key
          </button>
        </div>

        {keySaved && (
          <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> Custom Gemini API key saved!
          </p>
        )}
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
