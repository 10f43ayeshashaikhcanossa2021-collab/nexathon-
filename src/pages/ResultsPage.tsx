import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  ContentSubmission,
  ContentVersion,
  AnalysisReport,
  DetectedIssue,
} from '../types/inkloom';
import { api } from '../api/client';
import { StatusRail } from '../components/StatusRail';
import { DraftViewer } from '../components/DraftViewer';
import { FindingCard } from '../components/FindingCard';
import { ThreadLinesOverlay } from '../components/ThreadLinesOverlay';
import { buildSuggestedRevision } from '../services/revisionBuilder';
import {
  ArrowLeft,
  Sparkles,
  Send,
  Save,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Layers,
  Check,
  ChevronRight,
  ShieldAlert,
  Share2,
} from 'lucide-react';
import { SocialPublishModal } from '../components/SocialPublishModal';
import { CommentsThread } from '../components/CommentsThread';

interface ResultsPageProps {
  currentUser: User;
  submissionId: string;
  onNavigate: (page: string, params?: any) => void;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({
  currentUser,
  submissionId,
  onNavigate,
}) => {
  const [submission, setSubmission] = useState<ContentSubmission | null>(null);
  const [currentVersion, setCurrentVersion] = useState<ContentVersion | null>(null);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [activeIssueId, setActiveIssueId] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSubmissionData();
  }, [submissionId]);

  const loadSubmissionData = async () => {
    try {
      const data = await api.getSubmissionById(submissionId);
      setSubmission(data.submission);
      setCurrentVersion(data.currentVersion);
      setReport(data.latestReport);
      if (data.latestReport?.issues?.length) {
        setActiveIssueId(data.latestReport.issues[0].issue_id);
      }
    } catch (err: any) {
      console.error(err);
      setActionError(err.message || 'Failed to load submission');
    }
  };

  

const handleAcceptFinding = async (issueId: string) => {
  if (!currentVersion || !report || isApplying) return;

  setIsApplying(true);
  setActionError(null);
  setActionSuccess(null);

  try {
    const selectedIssue = report.issues.find(
      (issue) => issue.issue_id === issueId
    );

    if (!selectedIssue?.suggestion) {
      throw new Error('Suggested revision not found.');
    }

    if (selectedIssue.suggestion.status === 'accepted') {
      return;
    }

    // Mark this suggestion as accepted before building the revision
    const acceptedIssues = report.issues.map((issue) =>
      issue.issue_id === issueId
        ? {
            ...issue,
            suggestion: {
              ...issue.suggestion!,
              status: 'accepted' as const,
            },
          }
        : issue
    );

    // Apply the accepted suggestion to the document
    const revisedText = buildSuggestedRevision(
      currentVersion.body_text,
      acceptedIssues
    );

    if (revisedText === currentVersion.body_text) {
      throw new Error(
        'Revision could not be applied. Please check the finding offsets.'
      );
    }

    // Save a new version and run the analysis again
    await api.saveNewVersion(
      submissionId,
      revisedText,
      'ai_applied'
    );

    // Update the original suggestion status
    await api.updateSuggestion(issueId, 'accept');

    // Reload the latest document and AI report
    await loadSubmissionData();

    setActionSuccess(
      'Revision accepted! Your updated document is ready for review.'
    );

  } catch (err: any) {
    setActionError(
      err.message || 'Failed to apply the suggested revision.'
    );
  } finally {
    setIsApplying(false);
  }
};


  const handleEditFinding = async (issueId: string, finalText: string) => {
    try {
      await api.updateSuggestion(issueId, 'edit', finalText);
      await loadSubmissionData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDismissFinding = async (issueId: string, reason?: string) => {
    try {
      await api.updateSuggestion(issueId, 'dismiss', undefined, reason);
      await loadSubmissionData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Build the proposed revised draft in real-time
  const revisedDraft =
    currentVersion && report
      ? buildSuggestedRevision(currentVersion.body_text, report.issues)
      : undefined;

  const handleApplyAndSaveVersion = async () => {
    if (!currentVersion || !revisedDraft) return;
    setIsApplying(true);
    setActionError(null);
    try {
      const res = await api.saveNewVersion(submissionId, revisedDraft, 'ai_applied');
      setCurrentVersion(res.version);
      setReport(res.report);
      await loadSubmissionData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to create new version');
    } finally {
      setIsApplying(false);
    }
  };

  const handleSendForReview = async () => {
    setActionError(null);
    try {
      await api.sendForReview(submissionId);
      await loadSubmissionData();
      onNavigate('review-queue');
    } catch (err: any) {
      setActionError(err.message || 'Failed to send for review');
    }
  };

  if (!submission || !currentVersion || !report) {
    return (
      <div className="p-8 text-center text-slate-500">
        Loading submission findings and grounding references...
      </div>
    );
  }

  const unresolvedHighCount = report.issues.filter((i) => {
    if (i.severity !== 'high') return false;
    return !i.suggestion || i.suggestion.status === 'pending';
  }).length;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Nav & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="p-2 rounded-xl bg-white border border-[#D5DBE5] hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#0B1B3A]">{submission.title}</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold uppercase">
                v{currentVersion.version_no}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Submitted by {submission.creator_name || 'Creator'} • Content Type:{' '}
              <span className="font-semibold text-slate-700 capitalize">
                {submission.content_type.replace('_', ' ')}
              </span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          {submission.status === 'in_correction' && (
            <>
              <button
                type="button"
                onClick={handleApplyAndSaveVersion}
                disabled={isApplying}
                className="px-4 py-2 rounded-xl bg-white border border-[#D5DBE5] hover:bg-slate-50 text-slate-800 text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4 text-teal-600" />
                <span>Save Accepted as V{currentVersion.version_no + 1}</span>
              </button>

              <button
                type="button"
                onClick={handleSendForReview}
                disabled={unresolvedHighCount > 0}
                title={
    unresolvedHighCount > 0
      ? 'Resolve or justify all high severity findings first'
      : 'Send document for review'
  }
                className="px-4 py-2 rounded-xl bg-[#139A93] hover:bg-[#0D706B] text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Send for Review</span>
              </button>
            </>
          )}

          {submission.status === 'in_review' && (
            <button
              type="button"
              onClick={() => onNavigate('approval', { versionId: currentVersion.version_id })}
              className="px-4 py-2 rounded-xl bg-[#0B1B3A] hover:bg-[#162C5B] text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <span>Reviewer Decision Station</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {submission.status === 'approved' && (
            <button
              type="button"
              onClick={() => setIsPublishModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#139A93] hover:bg-[#0D706B] text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Broadcast to Social Media</span>
            </button>
          )}
        </div>
      </div>

      {/* Status Rail */}
      <StatusRail status={submission.status} highUnresolved={unresolvedHighCount} />

{actionSuccess && (
  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center gap-3 text-emerald-900 text-xs">
    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
    <div>
      <span className="font-bold">Revision Accepted! </span>
      {actionSuccess}
    </div>
  </div>
)}

      {/* Error alert if transition failed */}
      {actionError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 flex items-start gap-3 text-rose-900 text-xs">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Action Guard Notice: </span>
            {actionError}
          </div>
        </div>
      )}

      {/* AI Summary Banner */}
      <div className="bg-white border border-[#D5DBE5] rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-[#139A93] flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#0B1B3A]">
                AI Analysis Report • {report.model_name || 'gemini-3.8-flash'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Grounding Verified
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Evaluated against 16 brand rules, 14 verified facts, and vocabulary dictionary.
            </p>
          </div>
        </div>

        {/* Severity counts pill */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold">
            {report.summary.high} High
          </span>
          <span className="px-3 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
            {report.summary.medium} Medium
          </span>
          <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold">
            {report.summary.low} Low
          </span>
          <span className="px-3 py-1 rounded-xl bg-[#0B1B3A] text-white text-xs font-bold">
            {report.summary.total} Total Findings
          </span>
        </div>
      </div>

      {/* Main Split-Screen Workspace */}
      <div ref={containerRef} className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[550px]">
        {/* Thread lines overlay */}
        <ThreadLinesOverlay activeIssueId={activeIssueId} containerRef={containerRef} />

        {/* Left Column: DraftViewer (Paper Sheet) */}
        <div className="lg:col-span-7 h-full">
          <DraftViewer
            draft={currentVersion.body_text}
            revisedDraft={revisedDraft}
            issues={report.issues}
            activeIssueId={activeIssueId}
            onSelectIssue={(id) => setActiveIssueId(id)}
            media={currentVersion.media}
          />
        </div>

        {/* Right Column: Finding Cards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#0B1B3A] px-1">
            <span>Detected Findings ({report.issues.length})</span>
            <span className="text-[11px] text-slate-400 font-normal">Click card to align thread line</span>
          </div>

          <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
            {report.issues.map((issue) => (
              <FindingCard
                key={issue.issue_id}
                issue={issue}
                isActive={issue.issue_id === activeIssueId}
                isApplying={isApplying}
                onSelect={() => setActiveIssueId(issue.issue_id)}
                onAccept={handleAcceptFinding}
                onEdit={handleEditFinding}
                onDismiss={handleDismissFinding}
              />
            ))}

            {report.issues.length === 0 && (
              <div className="p-8 rounded-2xl bg-white border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-[#0B1B3A]">Zero Policy Violations</h4>
                <p className="text-xs text-slate-500">
                  This copy matches all active brand specifications and tone guidelines perfectly.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Collaboration and Reviewer Comments Thread */}
      <div className="mt-8">
        <CommentsThread
          submissionId={submission.submission_id}
          versionId={currentVersion.version_id}
          currentUser={currentUser}
        />
      </div>

      {/* Social Publish Modal */}
      {isPublishModalOpen && (
        <SocialPublishModal
          isOpen={isPublishModalOpen}
          submission={submission}
          version={currentVersion}
          onClose={() => setIsPublishModalOpen(false)}
          onPublishSuccess={() => {
            loadSubmissionData();
          }}
        />
      )}
    </div>
  );
};
