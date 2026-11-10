import React, { useState, useEffect } from 'react';
import { User, ContentSubmission, ContentVersion, AnalysisReport } from '../types/inkloom';
import { api } from '../api/client';
import { store } from '../services/store';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Clock,
  Sparkles,
  ShieldAlert,
  Image as ImageIcon,
  Share2,
} from 'lucide-react';
import { SocialPublishModal } from '../components/SocialPublishModal';
import { CommentsThread } from '../components/CommentsThread';
import { AutomatedBrandVisualCheck } from '../components/AutomatedBrandVisualCheck';
import { DiffChunk } from '../types/inkloom';

interface ApprovalPageProps {
  currentUser: User;
  versionId: string;
  onNavigate: (page: string, params?: any) => void;
}

export const ApprovalPage: React.FC<ApprovalPageProps> = ({
  currentUser,
  versionId,
  onNavigate,
}) => {
  const [version, setVersion] = useState<ContentVersion | null>(null);
  const [submission, setSubmission] = useState<ContentSubmission | null>(null);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [diffChunks, setDiffChunks] = useState<DiffChunk[]>([]);
  const [activeReviewTab, setActiveReviewTab] = useState<'visual_check' | 'copy_diff'>('visual_check');
  const [showDiffMode, setShowDiffMode] = useState(false);
  const [comment, setComment] = useState('');
  const [checklist, setChecklist] = useState({
    logoCorrect: true,
    colorsCompliant: true,
    imageryAppropriate: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [decisionError, setDecisionError] = useState<string | null>(null);
  const [decisionSuccess, setDecisionSuccess] = useState<string | null>(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [versionId]);

  const loadData = () => {
    const v = store.versions.find((item) => item.version_id === versionId);
    if (!v) return;
    setVersion(v);
    const s = store.getSubmissionById(v.submission_id);
    if (s) setSubmission(s);
    const r = store.getReportByVersionId(v.version_id);
    if (r) setReport(r);

    if (v.version_no > 1) {
      api.getVersionDiff(v.version_id).then((diff) => {
        if (diff && diff.length > 0) {
          setDiffChunks(diff);
          setShowDiffMode(true);
        }
      });
    }
  };

  if (!version || !submission) {
    return <div className="p-8 text-center text-slate-500">Loading version decision station...</div>;
  }

  const isCreator = submission.creator_id === currentUser.user_id;
  const isReviewerOrAdmin = currentUser.role === 'reviewer' || currentUser.role === 'admin';

  const handleDecision = async (decision: 'approved' | 'changes_requested') => {
    setDecisionError(null);
    setIsSubmitting(true);
    try {
      const res = await api.submitDecision(version.version_id, decision, comment, checklist);
      setDecisionSuccess(
        decision === 'approved'
          ? 'Submission successfully approved & stamped for publication!'
          : 'Changes requested. Submission returned to creator.'
      );
      setTimeout(() => {
        onNavigate('review-queue');
      }, 1800);
    } catch (err: any) {
      setDecisionError(err.message || 'Decision failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('review-queue')}
            className="p-2 rounded-xl bg-white border border-[#D5DBE5] hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#0B1B3A]">Reviewer Decision Station</h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold font-mono">
                v{version.version_no}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Evaluating: <strong className="text-slate-800">{submission.title}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Self-approval Warning if Creator */}
      {isCreator && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Self-Approval Guard (Part C.3): </span>
            You are the creator of this submission ({submission.creator_name}). To prevent conflict
            of interest, platform governance rules forbid self-approval. Please switch to Reviewer
            persona (e.g. Neil D'Souza or Anita Joshi) via the top bar to approve.
          </div>
        </div>
      )}

      {/* Decision Error Alert */}
      {decisionError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-start gap-3">
          <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Guard Violation: </span>
            {decisionError}
          </div>
        </div>
      )}

      {/* Decision Success Stamp */}
      {decisionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Decision Recorded: </span>
            {decisionSuccess}
          </div>
        </div>
      )}

      {/* Reviewer Station Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="inline-flex rounded-xl bg-slate-200/70 p-1 border border-slate-300 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveReviewTab('visual_check')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
              activeReviewTab === 'visual_check'
                ? 'bg-white text-[#0B1B3A] font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-teal-600" />
            <span>Automated Brand Visual Check</span>
            {version.media && version.media.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-teal-100 text-teal-800 text-[10px] font-mono">
                {version.media.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveReviewTab('copy_diff')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
              activeReviewTab === 'copy_diff'
                ? 'bg-white text-[#0B1B3A] font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-slate-600" />
            <span>Copy & Word Diff</span>
            {version.version_no > 1 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px] font-mono">
                v1&rarr;v{version.version_no}
              </span>
            )}
          </button>
        </div>

        {activeReviewTab === 'copy_diff' && version.version_no > 1 && (
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showDiffMode}
                onChange={(e) => setShowDiffMode(e.target.checked)}
                className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
              />
              <span>Highlight Word Revisions (Diff)</span>
            </label>
          </div>
        )}
      </div>

      {/* Tab 1: Automated Visual Brand Check */}
      {activeReviewTab === 'visual_check' && (
        <AutomatedBrandVisualCheck
          version={version}
          submission={submission}
          currentUser={currentUser}
          onIssueStatusChange={loadData}
        />
      )}

      {/* Tab 2: Copy & Word Diff Content */}
      {activeReviewTab === 'copy_diff' && (
        <div className="bg-white border border-[#D5DBE5] rounded-2xl p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
            <span>Submitted Copy (Version {version.version_no})</span>
            <span className="font-mono">{version.body_text.split(/\s+/).length} words</span>
          </div>

          <div className="paper-sheet rounded-xl p-6 space-y-4">
            {showDiffMode && diffChunks.length > 0 ? (
              <div className="font-serif text-slate-800 text-lg leading-relaxed whitespace-pre-wrap">
                {diffChunks.map((chunk, idx) => {
                  if (chunk.type === 'inserted') {
                    return (
                      <span
                        key={idx}
                        className="bg-emerald-100 text-emerald-900 border-b-2 border-emerald-500 font-semibold px-1 rounded-xs"
                        title="Added in this revision"
                      >
                        {chunk.value}{' '}
                      </span>
                    );
                  }
                  if (chunk.type === 'deleted') {
                    return (
                      <span
                        key={idx}
                        className="bg-rose-100 text-rose-800 line-through opacity-70 px-1 rounded-xs"
                        title="Removed from previous version"
                      >
                        {chunk.value}{' '}
                      </span>
                    );
                  }
                  return <span key={idx}>{chunk.value} </span>;
                })}
              </div>
            ) : (
              <p className="font-serif text-slate-800 text-lg leading-relaxed whitespace-pre-wrap">
                {version.body_text}
              </p>
            )}

            {version.media && version.media.length > 0 && (
              <div className="pt-4 border-t border-[#E8E4DC] space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0B1B3A] flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-teal-600" />
                  Attached Visual Assets ({version.media.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {version.media.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center gap-3 shadow-2xs"
                    >
                      {m.url ? (
                        <img
                          src={m.url}
                          alt={m.alt_text || m.name}
                          className="w-12 h-12 rounded-lg object-cover border border-slate-200 bg-slate-50 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                      )}
                      <div className="min-w-0 text-xs">
                        <div className="font-bold text-[#0B1B3A] truncate">{m.name}</div>
                        {m.alt_text ? (
                          <div className="text-[11px] text-emerald-700 truncate font-medium">
                            ✓ "{m.alt_text}"
                          </div>
                        ) : (
                          <div className="text-[10px] text-rose-700 font-bold">
                            ⚠️ Missing Alt Text
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Decision Controls & Collaboration Feedback Strip */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Decision Station & Checklist */}
        <div className="md:col-span-7 space-y-4">
          <div className="bg-white border border-[#D5DBE5] rounded-2xl p-6 shadow-xs space-y-5">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0B1B3A] mb-1">
                Visual Compliance Checklist
              </h3>
              <p className="text-[11px] text-slate-500">
                Confirm visual alignment against Lumora brand assets.
              </p>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.logoCorrect}
                  onChange={(e) => setChecklist({ ...checklist, logoCorrect: e.target.checked })}
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                />
                <span>Master Loom Logo is unaltered (G-06)</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.colorsCompliant}
                  onChange={(e) =>
                    setChecklist({ ...checklist, colorsCompliant: e.target.checked })
                  }
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                />
                <span>Palette uses approved Loom Teal (#139A93)</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.imageryAppropriate}
                  onChange={(e) =>
                    setChecklist({ ...checklist, imageryAppropriate: e.target.checked })
                  }
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                />
                <span>Imagery depicts real, sustainable training</span>
              </label>
            </div>

            {/* Reviewer Comment */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0B1B3A] mb-1.5">
                Reviewer Feedback / Decision Notes
              </label>
              <textarea
                rows={3}
                placeholder="Required when requesting changes. Include constructive notes for creator..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 border-t border-slate-100 flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleDecision('changes_requested')}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                <span>Request Changes</span>
              </button>

              <button
                type="button"
                onClick={() => handleDecision('approved')}
                disabled={isSubmitting || isCreator}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                title={isCreator ? 'Self-approval forbidden' : 'Approve for publication'}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve Content</span>
              </button>
            </div>

            {/* If approved, show Publish to Social button */}
            {submission.status === 'approved' && (
              <div className="pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPublishModalOpen(true)}
                  className="w-full py-2.5 rounded-xl bg-[#139A93] hover:bg-[#0D706B] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Broadcast to Social Channels</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Collaboration Feedback Thread */}
        <div className="md:col-span-5 space-y-4">
          <CommentsThread
            submissionId={submission.submission_id}
            versionId={version.version_id}
            currentUser={currentUser}
          />
        </div>
      </div>

      {/* Social Publish Modal */}
      {isPublishModalOpen && (
        <SocialPublishModal
          isOpen={isPublishModalOpen}
          submission={submission}
          version={version}
          onClose={() => setIsPublishModalOpen(false)}
          onPublishSuccess={() => {
            loadData();
          }}
        />
      )}
    </div>
  );
};
