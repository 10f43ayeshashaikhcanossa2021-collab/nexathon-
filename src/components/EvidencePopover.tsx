import React from 'react';
import { EvidenceItem } from '../types/inkloom';
import { store } from '../services/store';
import { BookOpen, FileCheck2, Tag, ExternalLink } from 'lucide-react';

interface EvidencePopoverProps {
  code: string;
  evidenceItems?: EvidenceItem[];
}

export const EvidencePopover: React.FC<EvidencePopoverProps> = ({ code, evidenceItems }) => {
  // Look up details from store if not provided
  let title = '';
  let text = '';
  let type: 'guideline' | 'fact' | 'term' = 'guideline';

  if (evidenceItems && evidenceItems.length > 0) {
    const item = evidenceItems.find((e) => e.code === code) || evidenceItems[0];
    title = item.title || code;
    text = item.text;
    type = item.type;
  } else {
    if (code.startsWith('G-')) {
      const g = store.guidelines.find((item) => item.code === code);
      if (g) {
        title = g.title;
        text = g.rule_text;
        type = 'guideline';
      }
    } else if (code.startsWith('F-')) {
      const f = store.facts.find((item) => item.code === code);
      if (f) {
        title = f.subject;
        text = f.statement;
        type = 'fact';
      }
    } else if (code.startsWith('T-')) {
      const t = store.terms.find((item) => item.code === code);
      if (t) {
        title = `Preferred Term: "${t.preferred_term}"`;
        text = `Avoid terms: ${t.avoid_terms.join(', ')}. ${t.notes || ''}`;
        type = 'term';
      }
    }
  }

  const getTypeBadge = () => {
    switch (type) {
      case 'fact':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <FileCheck2 className="w-3 h-3" />
            Approved Fact
          </span>
        );
      case 'term':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
            <Tag className="w-3 h-3" />
            Brand Vocabulary
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-[#0d706b] border border-teal-200">
            <BookOpen className="w-3 h-3" />
            Brand Guideline
          </span>
        );
    }
  };

  return (
    <div className="relative group inline-block">
      <button
        type="button"
        className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors inline-flex items-center gap-1 cursor-pointer"
      >
        <span>{code}</span>
      </button>

      {/* Popover Card */}
      <div className="absolute z-50 bottom-full left-0 mb-2 w-72 p-3 bg-white border border-[#D5DBE5] rounded-xl shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-150 transform -translate-y-1 group-hover:translate-y-0 text-left">
        <div className="flex items-center justify-between gap-2 mb-2">
          {getTypeBadge()}
          <span className="font-mono text-[10px] text-slate-400 font-semibold">{code}</span>
        </div>
        {title && <h5 className="text-xs font-bold text-[#0B1B3A] mb-1">{title}</h5>}
        <p className="text-xs text-slate-600 leading-relaxed font-sans">{text || 'Reference detail in brand hub.'}</p>
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
          <span>Tenant: Lumora Fitness</span>
          <span className="text-teal-600 font-medium">Verified Grounding</span>
        </div>
      </div>
    </div>
  );
};
