import React, { useState } from 'react';
import { DetectedIssue, DiffChunk, MediaItem } from '../types/inkloom';
import { computeWordDiff } from '../services/revisionBuilder';
import { Eye, FileText, SplitSquareVertical, Sparkles, Image as ImageIcon } from 'lucide-react';

interface DraftViewerProps {
  draft: string;
  revisedDraft?: string;
  issues: DetectedIssue[];
  activeIssueId: string | null;
  onSelectIssue: (issueId: string) => void;
  media?: MediaItem[];
}

export const DraftViewer: React.FC<DraftViewerProps> = ({
  draft,
  revisedDraft,
  issues,
  activeIssueId,
  onSelectIssue,
  media = [],
}) => {
  const [viewMode, setViewMode] = useState<'annotated' | 'diff'>('annotated');

  // Sort issues by start_offset
  const sortedIssues = [...issues].sort((a, b) => a.start_offset - b.start_offset);

  // Render annotated text with category highlights
  const renderAnnotatedText = () => {
    if (!sortedIssues.length) {
      return <span className="text-slate-800 font-serif text-lg leading-relaxed">{draft}</span>;
    }

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    sortedIssues.forEach((issue, idx) => {
      // Any text before the issue
      if (issue.start_offset > lastIndex) {
        elements.push(
          <span key={`plain-${lastIndex}`} className="text-slate-800 font-serif text-lg leading-relaxed">
            {draft.slice(lastIndex, issue.start_offset)}
          </span>
        );
      }

      // Category underline class
      let highlightClass = 'highlight-tone';
      if (issue.category === 'fact_conflict') highlightClass = 'highlight-fact-conflict';
      else if (issue.category === 'unsupported_claim') highlightClass = 'highlight-unsupported-claim';
      else if (issue.category === 'terminology') highlightClass = 'highlight-terminology';
      else if (issue.category === 'accessibility') highlightClass = 'highlight-accessibility';

      const isActive = issue.issue_id === activeIssueId;

      elements.push(
        <mark
          key={`issue-${issue.issue_id}-${idx}`}
          id={`draft-span-${issue.issue_id}`}
          onClick={() => onSelectIssue(issue.issue_id)}
          className={`cursor-pointer transition-all duration-150 ${highlightClass} ${
            isActive ? 'highlight-active font-semibold shadow-xs' : ''
          }`}
          title={`${issue.category}: ${issue.explanation}`}
        >
          <span className="font-serif text-lg leading-relaxed text-slate-950 font-medium">
            {issue.excerpt}
          </span>
        </mark>
      );

      lastIndex = Math.max(lastIndex, issue.end_offset);
    });

    if (lastIndex < draft.length) {
      elements.push(
        <span key={`plain-${lastIndex}`} className="text-slate-800 font-serif text-lg leading-relaxed">
          {draft.slice(lastIndex)}
        </span>
      );
    }

    return elements;
  };

  // Render Word-Level LCS Diff
  const renderDiff = () => {
    if (!revisedDraft) {
      return (
        <div className="text-center py-12 text-slate-400 text-sm">
          Accept or edit findings on the right to preview suggested revision diff.
        </div>
      );
    }

    const diffChunks: DiffChunk[] = computeWordDiff(draft, revisedDraft);

    return (
      <div className="font-serif text-lg leading-relaxed text-slate-800 whitespace-pre-wrap">
        {diffChunks.map((chunk, i) => {
          if (chunk.type === 'inserted') {
            return (
              <ins
                key={i}
                className="bg-emerald-100 text-emerald-900 underline decoration-emerald-500 font-semibold px-1 rounded no-underline"
              >
                {chunk.value}
              </ins>
            );
          }
          if (chunk.type === 'deleted') {
            return (
              <del
                key={i}
                className="bg-rose-100 text-rose-800 line-through opacity-75 px-1 rounded"
              >
                {chunk.value}
              </del>
            );
          }
          return <span key={i}>{chunk.value}</span>;
        })}
      </div>
    );
  };

  return (
    <div className="bg-white border border-[#D5DBE5] rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
      {/* Top Bar */}
      <div className="px-5 py-3.5 border-b border-[#D5DBE5] bg-slate-50/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#0B1B3A]">
            Draft Document Preview
          </span>
        </div>

        <div className="flex items-center gap-1 bg-white border border-slate-200 p-0.5 rounded-lg shadow-2xs">
          <button
            type="button"
            onClick={() => setViewMode('annotated')}
            className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === 'annotated'
                ? 'bg-[#0B1B3A] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Annotated Draft</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('diff')}
            className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === 'diff'
                ? 'bg-[#139A93] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span>Diff Preview</span>
          </button>
        </div>
      </div>

      {/* Sheet Canvas */}
      <div className="p-6 md:p-8 flex-1 overflow-y-auto bg-slate-100/50">
        <div className="paper-sheet rounded-xl p-8 max-w-2xl mx-auto min-h-[420px] transition-all flex flex-col justify-between">
          <div>{viewMode === 'annotated' ? renderAnnotatedText() : renderDiff()}</div>

          {/* Attached Media Assets Gallery */}
          {media && media.length > 0 && (
            <div className="mt-8 pt-6 border-t border-[#E8E4DC] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0B1B3A] flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-teal-600" />
                  Attached Media ({media.length})
                </span>
                <span className="text-[10px] text-slate-400">Rule G-10 Alt Text Check</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {media.map((m, idx) => {
                  const hasAlt = Boolean(m.alt_text?.trim());
                  const g10Issue = issues.find(
                    (i) =>
                      i.evidence_refs?.includes('G-10') ||
                      (i.category === 'accessibility' && i.excerpt.includes(m.name))
                  );
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        if (g10Issue) onSelectIssue(g10Issue.issue_id);
                      }}
                      className={`p-2.5 rounded-xl border bg-white flex items-center gap-3 transition-all ${
                        !hasAlt
                          ? 'border-rose-300 hover:border-rose-500 bg-rose-50/20 cursor-pointer shadow-xs'
                          : 'border-slate-200 shadow-2xs'
                      }`}
                      title={!hasAlt ? 'Click to inspect G-10 policy finding' : ''}
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
                        <div className="font-bold text-[#0B1B3A] truncate" title={m.name}>
                          {m.name}
                        </div>
                        {hasAlt ? (
                          <div
                            className="text-[11px] text-emerald-700 font-medium truncate mt-0.5"
                            title={m.alt_text || ''}
                          >
                            ✓ Alt: "{m.alt_text}"
                          </div>
                        ) : (
                          <div className="text-[10px] text-rose-700 font-bold mt-0.5 flex items-center gap-1">
                            ⚠️ Missing Alt Text (G-10)
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Legend Footer */}
      {viewMode === 'annotated' && (
        <div className="px-5 py-3 border-t border-[#D5DBE5] bg-white text-[11px] text-slate-500 flex flex-wrap items-center gap-4">
          <span className="font-semibold text-slate-700">Policy Legend:</span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1.5 bg-rose-600 rounded-full"></span>
            Fact Conflict (High)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1.5 bg-amber-500 rounded-full"></span>
            Unsupported Claim
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1.5 bg-sky-500 rounded-full"></span>
            Brand Vocabulary
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1.5 bg-purple-500 rounded-full"></span>
            Tone & Punctuation
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1.5 bg-emerald-500 rounded-full"></span>
            Accessibility
          </span>
        </div>
      )}
    </div>
  );
};
