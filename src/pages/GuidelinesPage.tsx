import React, { useState } from 'react';
import { User, BrandGuideline, ApprovedFact, TerminologyItem, BrandAsset } from '../types/inkloom';
import { store } from '../services/store';
import { api } from '../api/client';
import {
  BookOpen,
  Sparkles,
  FileCheck2,
  Palette,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Upload,
  ArrowRight,
  X,
  FileText,
  Trash2,
  Edit2,
  Tag,
  Image as ImageIcon,
} from 'lucide-react';
import { processImageFile } from '../utils/imageUtils';

interface GuidelinesPageProps {
  currentUser: User;
}

export const GuidelinesPage: React.FC<GuidelinesPageProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'guidelines' | 'facts' | 'terms' | 'assets'>('guidelines');
  const [guidelines, setGuidelines] = useState<BrandGuideline[]>(store.guidelines);
  const [facts, setFacts] = useState<ApprovedFact[]>(store.facts);
  const [terms, setTerms] = useState<TerminologyItem[]>(store.terms);
  const [assets, setAssets] = useState<BrandAsset[]>(store.assets);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modals
  const [isAddGuidelineOpen, setIsAddGuidelineOpen] = useState(false);
  const [isAddFactOpen, setIsAddFactOpen] = useState(false);
  const [isAddTermOpen, setIsAddTermOpen] = useState(false);
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Paste & Split State
  const [pasteText, setPasteText] = useState('');
  const [importProposed, setImportProposed] = useState<any[]>([]);

  // Add Guideline Form State
  const [newGCode, setNewGCode] = useState(`G-${guidelines.length + 1}`);
  const [newGTitle, setNewGTitle] = useState('');
  const [newGCategory, setNewGCategory] = useState<'tone' | 'claims' | 'terminology' | 'accessibility' | 'visual' | 'general'>('tone');
  const [newGRule, setNewGRule] = useState('');
  const [newGGood, setNewGGood] = useState('');
  const [newGBad, setNewGBad] = useState('');

  // Add Fact Form State
  const [newFCode, setNewFCode] = useState(`F-${facts.length + 1}`);
  const [newFStatement, setNewFStatement] = useState('');
  const [newFSubject, setNewFSubject] = useState('');
  const [newFSource, setNewFSource] = useState('');
  const [newFValidUntil, setNewFValidUntil] = useState('2028-12-31');

  // Add Term Form State
  const [newTCode, setNewTCode] = useState(`T-${terms.length + 1}`);
  const [newTPreferred, setNewTPreferred] = useState('');
  const [newTAvoid, setNewTAvoid] = useState('');
  const [newTNotes, setNewTNotes] = useState('');
  const [newTCase, setNewTCase] = useState(false);

  // Add Asset Form State
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetType, setNewAssetType] = useState<'logo' | 'color' | 'font' | 'image'>('image');
  const [newAssetUrl, setNewAssetUrl] = useState('');
  const [newAssetAlt, setNewAssetAlt] = useState('');
  const [isDraggingAsset, setIsDraggingAsset] = useState(false);
  const [assetUploadError, setAssetUploadError] = useState<string | null>(null);

  const isAdmin = currentUser.role === 'admin';

  // Handlers
  const handleCreateGuideline = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await api.createGuideline(store.profiles[0].profile_id, {
      code: newGCode,
      title: newGTitle,
      category: newGCategory,
      rule_text: newGRule,
      example_good: newGGood,
      example_bad: newGBad,
    });
    setGuidelines([...guidelines, created]);
    setIsAddGuidelineOpen(false);
    setNewGTitle('');
    setNewGRule('');
  };

  const handleCreateFact = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await api.createFact(store.profiles[0].profile_id, {
      code: newFCode,
      statement: newFStatement,
      subject: newFSubject || newFStatement.slice(0, 30),
      source_ref: newFSource,
      valid_until: newFValidUntil,
    });
    setFacts([...facts, created]);
    setIsAddFactOpen(false);
    setNewFStatement('');
    setNewFSubject('');
  };

  const handleCreateTerm = async (e: React.FormEvent) => {
    e.preventDefault();
    const avoids = newTAvoid.split(',').map((s) => s.trim()).filter(Boolean);
    const created = await api.createTerm(store.profiles[0].profile_id, {
      code: newTCode,
      preferred_term: newTPreferred,
      avoid_terms: avoids,
      notes: newTNotes,
      case_sensitive: newTCase,
    });
    setTerms([...terms, created]);
    setIsAddTermOpen(false);
    setNewTPreferred('');
    setNewTAvoid('');
  };

  const handleAssetFile = async (file: File) => {
    setAssetUploadError(null);
    try {
      const processed = await processImageFile(file, 1600);
      setNewAssetUrl(processed.url);
      if (!newAssetName) {
        setNewAssetName(file.name.replace(/\.[^/.]+$/, ''));
      }
    } catch (err: any) {
      setAssetUploadError('Failed to load image file: ' + err.message);
    }
  };

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetName.trim() || !newAssetUrl) {
      setAssetUploadError('Please provide both an asset name and an image file or URL.');
      return;
    }
    const created = await api.createAsset(store.profiles[0].profile_id, {
      name: newAssetName.trim(),
      asset_type: newAssetType,
      file_url: newAssetUrl,
      alt_text: newAssetAlt.trim() || undefined,
    });
    setAssets([...assets, created]);
    setIsAddAssetOpen(false);
    setNewAssetName('');
    setNewAssetUrl('');
    setNewAssetAlt('');
    setAssetUploadError(null);
  };

  const handleDeleteAsset = (assetId: string) => {
    store.assets = store.assets.filter((a) => a.asset_id !== assetId);
    store.persist();
    setAssets([...store.assets]);
  };

  // Paste & Split Splitter
  const handleProcessImport = () => {
    if (!pasteText.trim()) return;
    const lines = pasteText
      .split(/\n\s*\n|\n(?=\d+[.)]\s+)/)
      .map((s) => s.trim())
      .filter(Boolean);

    const proposed = lines.map((line, idx) => {
      let cat: any = 'general';
      const l = line.toLowerCase();
      if (l.includes('exclamation') || l.includes('voice') || l.includes('tone') || l.includes('calm')) cat = 'tone';
      else if (l.includes('best') || l.includes('guarantee') || l.includes('claim') || l.includes('100%')) cat = 'claims';
      else if (l.includes('alt text') || l.includes('link') || l.includes('contrast')) cat = 'accessibility';
      else if (l.includes('logo') || l.includes('color') || l.includes('palette')) cat = 'visual';

      return {
        code: `G-IMP-${idx + 1}`,
        title: line.slice(0, 35) + (line.length > 35 ? '...' : ''),
        category: cat,
        rule_text: line,
      };
    });

    setImportProposed(proposed);
  };

  const handleConfirmImport = async () => {
    for (const item of importProposed) {
      await api.createGuideline(store.profiles[0].profile_id, item);
    }
    setGuidelines(store.guidelines);
    setIsImportOpen(false);
    setPasteText('');
    setImportProposed([]);
  };

  // Filtered lists
  const filteredGuidelines = guidelines.filter((g) => {
    if (!g.is_active) return false;
    if (categoryFilter !== 'all' && g.category !== categoryFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return g.title.toLowerCase().includes(q) || g.rule_text.toLowerCase().includes(q) || g.code.toLowerCase().includes(q);
    }
    return true;
  });

  const filteredFacts = facts.filter((f) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return f.subject.toLowerCase().includes(q) || f.statement.toLowerCase().includes(q) || f.code.toLowerCase().includes(q);
    }
    return true;
  });

  const filteredTerms = terms.filter((t) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return t.preferred_term.toLowerCase().includes(q) || t.avoid_terms.some((a) => a.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1B3A]">Brand Governance Knowledge Base</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active guidelines, verified factual truth records, and vocabulary dictionary used for AI reference grounding.
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsImportOpen(true)}
              className="px-3.5 py-2 bg-white border border-[#D5DBE5] hover:bg-slate-50 text-[#0B1B3A] text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-teal-600" />
              <span>Paste & Split Import</span>
            </button>

            {activeTab === 'guidelines' && (
              <button
                type="button"
                onClick={() => setIsAddGuidelineOpen(true)}
                className="px-4 py-2 bg-[#139A93] hover:bg-[#0D706B] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Guideline</span>
              </button>
            )}

            {activeTab === 'facts' && (
              <button
                type="button"
                onClick={() => setIsAddFactOpen(true)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Approved Fact</span>
              </button>
            )}

            {activeTab === 'terms' && (
              <button
                type="button"
                onClick={() => setIsAddTermOpen(true)}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Term</span>
              </button>
            )}

            {activeTab === 'assets' && (
              <button
                type="button"
                onClick={() => setIsAddAssetOpen(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Brand Asset</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#D5DBE5] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('guidelines')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'guidelines'
              ? 'bg-[#0B1B3A] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Brand Guidelines ({guidelines.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('facts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'facts'
              ? 'bg-[#0B1B3A] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileCheck2 className="w-4 h-4 text-rose-400" />
          <span>Approved Facts ({facts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('terms')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'terms'
              ? 'bg-[#0B1B3A] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Tag className="w-4 h-4 text-sky-400" />
          <span>Brand Vocabulary ({terms.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('assets')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'assets'
              ? 'bg-[#0B1B3A] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Palette className="w-4 h-4 text-purple-400" />
          <span>Brand Assets ({assets.length})</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search code, title, or rule statement..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-[#D5DBE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs"
          />
        </div>

        {activeTab === 'guidelines' && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-semibold">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs p-1.5 bg-white border border-[#D5DBE5] rounded-xl focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="tone">Tone & Voice</option>
              <option value="claims">Claims & Evidence</option>
              <option value="terminology">Terminology</option>
              <option value="accessibility">Accessibility</option>
              <option value="visual">Visual</option>
              <option value="general">General</option>
            </select>
          </div>
        )}
      </div>

      {/* TAB 1: GUIDELINES */}
      {activeTab === 'guidelines' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGuidelines.map((g) => (
            <div
              key={g.guideline_id}
              className="bg-white border border-[#D5DBE5] rounded-2xl p-5 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-[#0B1B3A]">
                    {g.code}
                  </span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                    {g.category}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">v{g.version}</span>
              </div>

              <h4 className="text-sm font-bold text-[#0B1B3A]">{g.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">{g.rule_text}</p>

              {(g.example_good || g.example_bad) && (
                <div className="pt-2 border-t border-slate-100 space-y-1.5 text-[11px]">
                  {g.example_good && (
                    <div className="text-emerald-800 bg-emerald-50/60 p-2 rounded-lg border border-emerald-100">
                      <strong>Good: </strong> "{g.example_good}"
                    </div>
                  )}
                  {g.example_bad && (
                    <div className="text-rose-800 bg-rose-50/60 p-2 rounded-lg border border-rose-100">
                      <strong>Avoid: </strong> "{g.example_bad}"
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: FACTS */}
      {activeTab === 'facts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFacts.map((f) => {
            const isExpired = f.valid_until && f.valid_until < new Date().toISOString().split('T')[0];
            return (
              <div
                key={f.fact_id}
                className={`bg-white border rounded-2xl p-5 shadow-xs space-y-3 ${
                  isExpired ? 'border-rose-300 bg-rose-50/30' : 'border-[#D5DBE5]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-900 border border-rose-200">
                      {f.code}
                    </span>
                    <span className="text-xs font-bold text-[#0B1B3A]">{f.subject}</span>
                  </div>
                  {isExpired && (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                      Expired
                    </span>
                  )}
                </div>

                <div className="paper-sheet p-3 rounded-xl">
                  <p className="text-xs font-serif text-slate-800 leading-relaxed font-medium">
                    "{f.statement}"
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Source: {f.source_ref || 'Corporate Registry'}</span>
                  <span>Valid until: {f.valid_until || 'Indefinite'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: TERMINOLOGY */}
      {activeTab === 'terms' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTerms.map((t) => (
            <div
              key={t.term_id}
              className="bg-white border border-[#D5DBE5] rounded-2xl p-5 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-900 border border-sky-200">
                  {t.code}
                </span>
                {t.case_sensitive && (
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                    Case-Sensitive
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="text-xs font-bold text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 flex items-center justify-between">
                  <span>Preferred Term:</span>
                  <span className="font-mono text-sm font-black">"{t.preferred_term}"</span>
                </div>

                <div className="text-xs text-rose-800 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                  <div className="font-bold mb-1">Forbidden / Avoid Terms:</div>
                  <div className="font-mono text-xs text-rose-900">
                    {t.avoid_terms.map((a) => `"${a}"`).join(', ')}
                  </div>
                </div>
              </div>

              {t.notes && <p className="text-[11px] text-slate-500">{t.notes}</p>}
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: ASSETS */}
      {activeTab === 'assets' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Quick Upload Action Card */}
            {isAdmin && (
              <div
                onClick={() => setIsAddAssetOpen(true)}
                className="border-2 border-dashed border-purple-300 hover:border-purple-500 bg-purple-50/40 hover:bg-purple-50/80 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all group min-h-[220px] text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0B1B3A]">Upload New Brand Asset</div>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-[200px]">
                    PNG, JPG, SVG logos, color palettes, and certified brand imagery
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-purple-700 bg-purple-100/70 px-3 py-1 rounded-full group-hover:bg-purple-200 transition-colors">
                  + Add Asset
                </span>
              </div>
            )}

            {assets.map((a) => (
              <div
                key={a.asset_id}
                className="bg-white border border-[#D5DBE5] rounded-2xl p-5 shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200">
                      {a.asset_id}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {a.asset_type}
                      </span>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => handleDeleteAsset(a.asset_id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition-colors"
                          title="Delete asset"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-[#0B1B3A] truncate" title={a.name}>
                    {a.name}
                  </h4>

                  {a.file_url ? (
                    <div className="h-40 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                      <img
                        src={a.file_url}
                        alt={a.alt_text || a.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-40 rounded-xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-xs">
                      No visual preview
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                  <strong className="text-slate-700">Alt Text: </strong>
                  {a.alt_text ? (
                    <span className="text-slate-800 italic font-serif">"{a.alt_text}"</span>
                  ) : (
                    <span className="text-amber-600 font-semibold">None (G-10 violation trigger)</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Add Guideline */}
      {isAddGuidelineOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <form
            onSubmit={handleCreateGuideline}
            className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-[#0B1B3A]">Create Brand Guideline</h3>
              <button
                type="button"
                onClick={() => setIsAddGuidelineOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Code
                </label>
                <input
                  type="text"
                  value={newGCode}
                  onChange={(e) => setNewGCode(e.target.value)}
                  className="w-full text-xs font-mono p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Category
                </label>
                <select
                  value={newGCategory}
                  onChange={(e) => setNewGCategory(e.target.value as any)}
                  className="w-full text-xs p-2 border rounded-lg"
                >
                  <option value="tone">Tone & Voice</option>
                  <option value="claims">Claims & Evidence</option>
                  <option value="terminology">Terminology</option>
                  <option value="accessibility">Accessibility</option>
                  <option value="visual">Visual</option>
                  <option value="general">General</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                Title
              </label>
              <input
                type="text"
                placeholder="e.g. Health Outcome Promises"
                value={newGTitle}
                onChange={(e) => setNewGTitle(e.target.value)}
                required
                className="w-full text-xs p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                Rule Specification
              </label>
              <textarea
                rows={3}
                placeholder="State the compliance policy clearly..."
                value={newGRule}
                onChange={(e) => setNewGRule(e.target.value)}
                required
                className="w-full text-xs p-2 border rounded-lg font-serif"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setIsAddGuidelineOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#139A93] text-white text-xs font-semibold rounded-lg hover:bg-[#0D706B]"
              >
                Create Guideline
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Add Fact */}
      {isAddFactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <form
            onSubmit={handleCreateFact}
            className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-[#0B1B3A]">Register Verified Brand Fact</h3>
              <button
                type="button"
                onClick={() => setIsAddFactOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Fact Code
                </label>
                <input
                  type="text"
                  value={newFCode}
                  onChange={(e) => setNewFCode(e.target.value)}
                  className="w-full text-xs font-mono p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Valid Until
                </label>
                <input
                  type="date"
                  value={newFValidUntil}
                  onChange={(e) => setNewFValidUntil(e.target.value)}
                  className="w-full text-xs p-2 border rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                Subject
              </label>
              <input
                type="text"
                placeholder="e.g. Pro Plan Pricing"
                value={newFSubject}
                onChange={(e) => setNewFSubject(e.target.value)}
                required
                className="w-full text-xs p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                Verified Factual Statement
              </label>
              <textarea
                rows={3}
                placeholder="Exact verified factual truth..."
                value={newFStatement}
                onChange={(e) => setNewFStatement(e.target.value)}
                required
                className="w-full text-xs p-2 border rounded-lg font-serif"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setIsAddFactOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-700"
              >
                Register Fact
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Add Term */}
      {isAddTermOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <form
            onSubmit={handleCreateTerm}
            className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-[#0B1B3A]">Add Vocabulary Rule</h3>
              <button
                type="button"
                onClick={() => setIsAddTermOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Term Code
                </label>
                <input
                  type="text"
                  value={newTCode}
                  onChange={(e) => setNewTCode(e.target.value)}
                  className="w-full text-xs font-mono p-2 border rounded-lg"
                />
              </div>
              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newTCase}
                    onChange={(e) => setNewTCase(e.target.checked)}
                    className="rounded text-teal-600 w-4 h-4"
                  />
                  <span>Case Sensitive</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                Preferred Term
              </label>
              <input
                type="text"
                placeholder="e.g. members"
                value={newTPreferred}
                onChange={(e) => setNewTPreferred(e.target.value)}
                required
                className="w-full text-xs font-mono p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                Avoid Terms (Comma Separated)
              </label>
              <input
                type="text"
                placeholder="e.g. customers, users, clients"
                value={newTAvoid}
                onChange={(e) => setNewTAvoid(e.target.value)}
                required
                className="w-full text-xs font-mono p-2 border rounded-lg"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setIsAddTermOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-sky-600 text-white text-xs font-semibold rounded-lg hover:bg-sky-700"
              >
                Add Term
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Paste & Split Importer (Part F.2) */}
      {isImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-[#0B1B3A]">
                  Paste & Split Importer (Part F.2)
                </h3>
                <p className="text-xs text-slate-500">
                  Paste long guideline manuals; automatically splits into individual rule cards.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsImportOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <textarea
                rows={6}
                placeholder="Paste guideline text paragraphs here (separated by blank lines or numbers)..."
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                className="w-full text-xs font-serif p-3 bg-slate-50 border border-slate-300 rounded-xl"
              />

              <button
                type="button"
                onClick={handleProcessImport}
                disabled={!pasteText.trim()}
                className="px-4 py-2 bg-[#0B1B3A] text-white text-xs font-semibold rounded-xl hover:bg-[#162C5B] transition-colors disabled:opacity-50"
              >
                Split & Preview Proposed Rules
              </button>

              {importProposed.length > 0 && (
                <div className="space-y-2 mt-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Proposed Rules ({importProposed.length})
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {importProposed.map((p, i) => (
                      <div
                        key={i}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-[#0B1B3A]">{p.code}</span>
                          <span className="text-[10px] uppercase font-bold text-teal-800 bg-teal-50 px-2 py-0.2 rounded border border-teal-200">
                            {p.category}
                          </span>
                        </div>
                        <p className="font-serif text-slate-700">{p.rule_text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t bg-slate-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsImportOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={importProposed.length === 0}
                className="px-4 py-1.5 bg-[#139A93] text-white text-xs font-semibold rounded-lg hover:bg-[#0D706B] disabled:opacity-50"
              >
                Import All Proposed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Upload Brand Asset */}
      {isAddAssetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <form
            onSubmit={handleCreateAsset}
            className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-[#0B1B3A]">Upload New Brand Asset</h3>
              <button
                type="button"
                onClick={() => {
                  setIsAddAssetOpen(false);
                  setAssetUploadError(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {assetUploadError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{assetUploadError}</span>
              </div>
            )}

            {/* Drag & Drop Image Uploader */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingAsset(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDraggingAsset(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingAsset(false);
                if (e.dataTransfer.files?.[0]) {
                  handleAssetFile(e.dataTransfer.files[0]);
                }
              }}
              className="space-y-2"
            >
              <label className="block text-[11px] font-bold uppercase text-slate-500">
                Asset Image or Logo File
              </label>

              {newAssetUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 p-2 flex items-center gap-3">
                  <img
                    src={newAssetUrl}
                    alt="Preview"
                    className="w-16 h-16 rounded-lg object-cover border border-slate-200 bg-white"
                  />
                  <div className="flex-1 min-w-0 text-xs">
                    <span className="font-bold text-slate-800 truncate block">
                      Image File Ready
                    </span>
                    <label className="text-teal-600 hover:text-teal-700 font-semibold cursor-pointer text-[11px] inline-block mt-0.5">
                      Replace Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files?.[0]) handleAssetFile(e.target.files[0]);
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNewAssetUrl('')}
                    className="text-slate-400 hover:text-rose-600 p-1.5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label
                  className={`border-2 border-dashed p-4 rounded-xl flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all text-center ${
                    isDraggingAsset
                      ? 'border-purple-600 bg-purple-100/60 ring-2 ring-purple-500'
                      : 'border-purple-300 hover:border-purple-500 bg-purple-50/40 hover:bg-purple-50/80'
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Upload className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-[#0B1B3A]">
                    Click to browse or drop brand image here
                  </span>
                  <p className="text-[10px] text-slate-500">PNG, JPG, SVG, WebP</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleAssetFile(e.target.files[0]);
                    }}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Asset Type
                </label>
                <select
                  value={newAssetType}
                  onChange={(e) => setNewAssetType(e.target.value as any)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-slate-50"
                >
                  <option value="image">Image / Graphic</option>
                  <option value="logo">Brand Logo</option>
                  <option value="color">Color Palette</option>
                  <option value="font">Typography Asset</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Asset Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Master Loom Logo 2026"
                  value={newAssetName}
                  onChange={(e) => setNewAssetName(e.target.value)}
                  required
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                Mandatory Alt Text (G-10 Compliance)
              </label>
              <input
                type="text"
                placeholder="e.g. Lumora Loom teal icon with white interlocking ribbons"
                value={newAssetAlt}
                onChange={(e) => setNewAssetAlt(e.target.value)}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Submissions using this asset without this alt text will be flagged by Rule G-10.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => {
                  setIsAddAssetOpen(false);
                  setAssetUploadError(null);
                }}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newAssetUrl || !newAssetName.trim()}
                className="px-4 py-1.5 bg-purple-600 text-white text-xs font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                Register Brand Asset
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
