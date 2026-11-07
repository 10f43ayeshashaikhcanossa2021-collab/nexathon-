import React, { useState } from 'react';
import { User, BrandProfile } from '../types/inkloom';
import { store } from '../services/store';
import { api } from '../api/client';
import {
  BookOpen,
  Sparkles,
  Layers,
  FileCheck2,
  Shield,
  Palette,
  CheckCircle2,
  Edit2,
  Save,
  Users,
  Eye,
  Sliders,
} from 'lucide-react';

interface BrandHubPageProps {
  currentUser: User;
  onNavigate: (page: string) => void;
}

export const BrandHubPage: React.FC<BrandHubPageProps> = ({
  currentUser,
  onNavigate,
}) => {
  const [profile, setProfile] = useState<BrandProfile>(store.profiles[0]);
  const [isEditingVoice, setIsEditingVoice] = useState(false);
  const [voiceNotes, setVoiceNotes] = useState(profile.voice_notes);
  const [isSaving, setIsSaving] = useState(false);

  const isAdmin = currentUser.role === 'admin';

  // Live counts
  const guidelinesCount = store.guidelines.filter(
    (g) => g.profile_id === profile.profile_id && g.is_active
  ).length;
  const factsCount = store.facts.filter(
    (f) => f.profile_id === profile.profile_id && f.is_active
  ).length;
  const termsCount = store.terms.filter(
    (t) => t.profile_id === profile.profile_id
  ).length;
  const assetsCount = store.assets.filter(
    (a) => a.profile_id === profile.profile_id
  ).length;

  const handleSaveVoice = async () => {
    setIsSaving(true);
    try {
      const updated = await api.updateProfile(profile.profile_id, {
        voice_notes: voiceNotes,
      });
      setProfile(updated);
      setIsEditingVoice(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleExternalAi = async () => {
    if (!isAdmin) return;
    try {
      const updated = await api.updateProfile(profile.profile_id, {
        external_ai_allowed: !profile.external_ai_allowed,
      });
      setProfile(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleTeamVisibility = async () => {
    if (!isAdmin) return;
    const nextVis = profile.team_visibility === 'own' ? 'team' : 'own';
    try {
      const updated = await api.updateProfile(profile.profile_id, {
        team_visibility: nextVis,
      });
      setProfile(updated);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Profile Card */}
      <div className="bg-white p-6 rounded-2xl border border-[#D5DBE5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-bold text-[#139A93] tracking-wider">
              Profile #{profile.profile_id.replace('prof-', '')}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold uppercase">
              {profile.status}
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#0B1B3A]">{profile.name} Brand Hub</h1>
          <p className="text-xs text-slate-500 mt-1">
            Centrally governed rules, verified factual truth records, and vocabulary dictionary.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('guidelines')}
            className="px-4 py-2 bg-[#139A93] hover:bg-[#0D706B] text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>Manage Guidelines & Facts</span>
          </button>
        </div>
      </div>

      {/* Grid: 4 Governance Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigate('guidelines')}
          className="bg-white p-5 rounded-2xl border border-[#D5DBE5] shadow-xs hover:border-teal-400 transition-all cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center text-[#139A93] mb-3">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Rules</div>
          <div className="text-2xl font-black text-[#0B1B3A] mt-1">{guidelinesCount}</div>
          <div className="text-[11px] text-teal-600 font-semibold mt-1">Tone, Claims & A11y</div>
        </div>

        <div
          onClick={() => onNavigate('guidelines')}
          className="bg-white p-5 rounded-2xl border border-[#D5DBE5] shadow-xs hover:border-teal-400 transition-all cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 mb-3">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Approved Facts</div>
          <div className="text-2xl font-black text-[#0B1B3A] mt-1">{factsCount}</div>
          <div className="text-[11px] text-rose-600 font-semibold mt-1">Pricing, Specs & Policies</div>
        </div>

        <div
          onClick={() => onNavigate('guidelines')}
          className="bg-white p-5 rounded-2xl border border-[#D5DBE5] shadow-xs hover:border-teal-400 transition-all cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 mb-3">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Brand Dictionary</div>
          <div className="text-2xl font-black text-[#0B1B3A] mt-1">{termsCount}</div>
          <div className="text-[11px] text-sky-600 font-semibold mt-1">Preferred Vocabulary</div>
        </div>

        <div
          onClick={() => onNavigate('guidelines')}
          className="bg-white p-5 rounded-2xl border border-[#D5DBE5] shadow-xs hover:border-teal-400 transition-all cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mb-3">
            <Palette className="w-5 h-5" />
          </div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Brand Assets</div>
          <div className="text-2xl font-black text-[#0B1B3A] mt-1">{assetsCount}</div>
          <div className="text-[11px] text-purple-600 font-semibold mt-1">Logos & Imagery</div>
        </div>
      </div>

      {/* Voice Notes Card */}
      <div className="bg-white border border-[#D5DBE5] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#139A93]" />
            <h3 className="text-sm font-bold text-[#0B1B3A]">Brand Voice Notes & Philosophy</h3>
          </div>
          {isAdmin && !isEditingVoice && (
            <button
              type="button"
              onClick={() => setIsEditingVoice(true)}
              className="text-xs text-[#139A93] hover:text-[#0D706B] font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Voice Notes</span>
            </button>
          )}
        </div>

        {isEditingVoice ? (
          <div className="space-y-3">
            <textarea
              rows={4}
              value={voiceNotes}
              onChange={(e) => setVoiceNotes(e.target.value)}
              className="w-full text-xs font-serif p-3 bg-slate-50 border border-teal-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 leading-relaxed"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditingVoice(false)}
                className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveVoice}
                disabled={isSaving}
                className="px-4 py-1.5 bg-[#139A93] text-white text-xs font-semibold rounded-lg hover:bg-[#0D706B] flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#FBFAF7] border border-[#E8E4DC] p-4 rounded-xl text-xs font-serif text-slate-700 leading-relaxed">
            "{profile.voice_notes}"
          </div>
        )}
      </div>

      {/* Governance Controls (Admin only) */}
      <div className="bg-white border border-[#D5DBE5] rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#0B1B3A]">Tenant Governance Controls</h3>

        <div className="divide-y divide-slate-100 text-xs">
          <div className="py-3 flex items-center justify-between">
            <div>
              <div className="font-bold text-[#0B1B3A]">Gemini External AI Integration</div>
              <div className="text-slate-500 text-[11px]">
                Enables live Gemini 3.8 Flash model reasoning alongside deterministic rule evaluator.
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggleExternalAi}
              disabled={!isAdmin}
              className={`px-3 py-1.5 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-colors cursor-pointer ${
                profile.external_ai_allowed
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {profile.external_ai_allowed ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <div className="font-bold text-[#0B1B3A]">Creator Team Visibility</div>
              <div className="text-slate-500 text-[11px]">
                Allow creators to see drafts from all team members or restrict to their own submissions.
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggleTeamVisibility}
              disabled={!isAdmin}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0B1B3A] font-bold text-[10px] uppercase tracking-wider border border-slate-300 transition-colors cursor-pointer"
            >
              {profile.team_visibility === 'team' ? 'Team-Wide' : 'Own Only'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
