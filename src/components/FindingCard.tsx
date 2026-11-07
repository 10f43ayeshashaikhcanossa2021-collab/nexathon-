import React, { useState } from 'react';
import { DetectedIssue, SuggestionStatus } from '../types/inkloom';
import { EvidencePopover } from './EvidencePopover';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  Check,
  X,
  Edit2,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface FindingCardProps {
  issue: DetectedIssue;
  isActive: boolean;
  onSelect: () => void;
  onAccept: (issueId: string) => void;
  onEdit: (issueId: string, finalText: string) => void;
  onDismiss: (issueId: string, reason?: string) => void;
}

export const FindingCard: React.FC<FindingCardProps> = ({
  issue,
  isActive,
  onSelect,
  onAccept,
  onEdit,
  onDismiss,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(
    issue.suggestion?.final_text || issue.suggestion?.suggested_text || ''
  );
  const [dismissReason, setDismissReason] = useState('');
  const [showDismissInput, setShowDismissInput] = useState(false);
  const [dismissError, setDismissError] = useState('');

  const status = issue.suggestion?.status || 'pending';

  const getSeverityBadge = () => {
    switch (issue.severity) {
      case 'high':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300">
            HIGH SEVERITY
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
            MEDIUM SEVERITY
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-300">
            LOW SEVERITY
          </span>
        );
    }
  };

  const getStatusPill = () => {
    switch (issue.status) {
      case 'verified_conflict':
        return (
          <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
            Verified Conflict
          </span>
        );
      case 'needs_human_check':
        return (
          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            Needs Human Check
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
            Rule Violation
          </span>
        );
    }
  };

  const handleSaveEdit = () => {
    onEdit(issue.issue_id, editText);
    setIsEditing(false);
  };

  const handleConfirmDismiss = () => {
    if (issue.severity === 'high' && !dismissReason.trim()) {
      setDismissError('A justification is strictly required to dismiss High severity findings.');
      return;
    }
    onDismiss(issue.issue_id, dismissReason.trim());
    setShowDismissInput(false);
    setDismissError('');
  };

  return (
    <div
      id={`finding-card-${issue.issue_id}`}
      onClick={onSelect}
      className={`rounded-2xl border transition-all duration-200 p-4 bg-white cursor-pointer relative ${
        isActive
          ? 'border-[#139A93] shadow-md ring-2 ring-teal-500/20'
          : 'border-[#D5DBE5] hover:border-slate-400 shadow-xs'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {getSeverityBadge()}
          {getStatusPill()}
        </div>
        <div className="flex items-center gap-1.5">
          {issue.evidence_refs.map((ref) => (
            <EvidencePopover key={ref} code={ref} evidenceItems={issue.evidence_items} />
          ))}
        </div>
      </div>

      {/* Excerpt */}
      <div className="mb-2">
        <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">
          Flagged Excerpt
        </div>
        <p className="font-mono text-xs bg-slate-50 border border-slate-200 p-2 rounded-lg text-rose-900 font-semibold break-words">
          "{issue.excerpt}"
        </p>
      </div>

      {/* Explanation */}
      <p className="text-xs text-slate-700 leading-relaxed mb-3">{issue.explanation}</p>

      {/* Suggestion Box */}
      {issue.suggestion && (
        <div className="bg-[#FBFAF7] border border-[#E8E4DC] rounded-xl p-3 mb-3">
          <div className="flex items-center justify-between text-[11px] text-teal-800 font-bold mb-1">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#139A93]" />
              Suggested Revision:
            </span>
            {status !== 'pending' && (
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  status === 'accepted'
                    ? 'bg-emerald-100 text-emerald-800'
                    : status === 'edited'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {status}
              </span>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-2 mt-2">
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full text-xs font-mono p-2 bg-white border border-teal-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-3 py-1 text-xs bg-[#139A93] text-white font-semibold rounded-md hover:bg-[#0D706B]"
                >
                  Save Custom Text
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="font-mono text-xs text-emerald-900 font-semibold">
                "{status === 'edited' ? issue.suggestion.final_text : issue.suggestion.suggested_text || '(Remove excerpt)'}"
              </p>
              <p className="text-[11px] text-slate-500 mt-1">{issue.suggestion.rationale}</p>
            </div>
          )}
        </div>
      )}

      {/* Dismissal input for High Severity justification */}
      {showDismissInput && (
        <div className="mb-3 p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
          <label className="block text-[11px] font-bold text-rose-900">
            Justification required to dismiss {issue.severity.toUpperCase()} severity finding:
          </label>
          <input
            type="text"
            placeholder="e.g. Approved exception by brand director for Q3 campaign"
            value={dismissReason}
            onChange={(e) => {
              setDismissReason(e.target.value);
              setDismissError('');
            }}
            className="w-full text-xs p-2 bg-white border border-rose-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
          {dismissError && <p className="text-[11px] text-rose-600 font-medium">{dismissError}</p>}
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowDismissInput(false)}
              className="px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-100 rounded-md"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDismiss}
              className="px-3 py-1 text-xs bg-rose-600 text-white font-semibold rounded-md hover:bg-rose-700"
            >
              Confirm Dismissal
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (issue.severity === 'high' && !showDismissInput) {
              setShowDismissInput(true);
            } else {
              onDismiss(issue.issue_id);
            }
          }}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
          <span>Dismiss</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(!isEditing);
          }}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>Edit</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAccept(issue.issue_id);
          }}
          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#139A93] hover:bg-[#0D706B] text-white flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Accept</span>
        </button>
      </div>
    </div>
  );
};
