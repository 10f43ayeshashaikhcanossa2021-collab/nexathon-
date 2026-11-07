import React, { useState } from 'react';
import {
  X,
  Share2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Send,
  Sparkles,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';
import {
  ContentSubmission,
  ContentVersion,
  SocialAccount,
  SocialProvider,
  PublishJob,
  PublishResult,
} from '../types/inkloom';
import { api } from '../api/client';
import { store } from '../services/store';

interface SocialPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: ContentSubmission;
  version: ContentVersion;
  onPublishSuccess?: (job: PublishJob, result?: PublishResult) => void;
}

export const SocialPublishModal: React.FC<SocialPublishModalProps> = ({
  isOpen,
  onClose,
  submission,
  version,
  onPublishSuccess,
}) => {
  const [selectedProvider, setSelectedProvider] = useState<SocialProvider>('linkedin');
  const [accounts, setAccounts] = useState<SocialAccount[]>(() => store.getSocialAccounts());
  const [selectedAccountId, setSelectedAccountId] = useState<string>(() => {
    const defaultAcc = store.getSocialAccounts().find((a) => a.provider === 'linkedin' && a.status === 'connected');
    return defaultAcc ? defaultAcc.account_id : store.getSocialAccounts()[0]?.account_id || '';
  });

  const [caption, setCaption] = useState<string>(() => {
    // Trim clean copy for social broadcast
    return version.body_text || '';
  });
  const [hashtags, setHashtags] = useState<string>('#LumoraFitness #DailyMovement #HealthJourney');
  const [publishMode, setPublishMode] = useState<'now' | 'schedule'>('now');
  const [scheduledDate, setScheduledDate] = useState<string>(() => {
    const tomorrow = new Date(Date.now() + 86400000);
    return tomorrow.toISOString().slice(0, 16);
  });
  const [timezone, setTimezone] = useState<string>('UTC');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState<{ job: PublishJob; result?: PublishResult } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isApproved = submission.status === 'approved';

  // Character limits
  const charLimits: Record<SocialProvider, number> = {
    x_twitter: 280,
    meta_instagram: 2200,
    linkedin: 3000,
    meta_facebook: 63206,
  };

  const currentLimit = charLimits[selectedProvider];
  const totalLength = caption.length + (hashtags ? hashtags.length + 1 : 0);
  const isOverLimit = totalLength > currentLimit;

  // Filter accounts for selected provider
  const availableAccounts = accounts.filter((a) => a.provider === selectedProvider);
  const selectedAccount = accounts.find((a) => a.account_id === selectedAccountId);

  const handleProviderChange = (p: SocialProvider) => {
    setSelectedProvider(p);
    const matching = accounts.find((a) => a.provider === p && a.status === 'connected') || accounts.find((a) => a.provider === p);
    if (matching) setSelectedAccountId(matching.account_id);
  };

  const handleExecutePublish = async () => {
    setErrorMessage(null);

    if (!isApproved) {
      setErrorMessage('Cannot publish: Only human-approved content versions can be broadcasted to social media.');
      return;
    }

    if (!selectedAccountId) {
      setErrorMessage('Please select a connected social account.');
      return;
    }

    if (isOverLimit) {
      setErrorMessage(`Caption exceeds the ${selectedProvider} limit of ${currentLimit} characters.`);
      return;
    }

    setIsSubmitting(true);

    const fullCaption = hashtags.trim() ? `${caption.trim()}\n\n${hashtags.trim()}` : caption.trim();
    const mediaUrls = version.media?.map((m) => m.url).filter(Boolean) as string[];

    try {
      if (publishMode === 'now') {
        const { job, result } = await api.publishNow({
          submissionId: submission.submission_id,
          accountId: selectedAccountId,
          provider: selectedProvider,
          caption: fullCaption,
          mediaUrls,
        });

        setPublishSuccess({ job, result });
        if (onPublishSuccess) onPublishSuccess(job, result);
      } else {
        const job = await api.schedulePublish({
          submissionId: submission.submission_id,
          accountId: selectedAccountId,
          provider: selectedProvider,
          caption: fullCaption,
          mediaUrls,
          scheduledTime: new Date(scheduledDate).toISOString(),
          timezone,
        });

        setPublishSuccess({ job });
        if (onPublishSuccess) onPublishSuccess(job);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Publishing action failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#0B1B3A]">
                  Publish Human-Approved Content to Social Channels
                </h3>
                {isApproved ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Human Approved
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-amber-600" />
                    {submission.status.replace('_', ' ').toUpperCase()} (Unapproved)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Source: <strong>{submission.title}</strong> (Version {version.version_no})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Policy Guard Warning if not approved */}
          {!isApproved && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Governance Safety Rule: </span>
                This content version is in status <strong>"{submission.status}"</strong> and has not
                yet received final reviewer approval. INKLOOM AI policy forbids publishing unapproved
                copy to public brand channels.
              </div>
            </div>
          )}

          {/* Success Banner */}
          {publishSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-950">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  {publishSuccess.result
                    ? 'Successfully Published to Social Channel!'
                    : 'Post Scheduled Successfully!'}
                </span>
              </div>
              <p className="text-slate-700">
                Broadcast job ID: <code className="font-mono bg-white px-1.5 py-0.5 rounded border">{publishSuccess.job.job_id}</code>.
              </p>
              {publishSuccess.result?.provider_url && (
                <div className="pt-1">
                  <a
                    href={publishSuccess.result.provider_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-900 underline"
                  >
                    <span>View Live Post on {selectedProvider.replace('_', ' ')}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Grid Layout: Controls on Left, Live Social Preview on Right */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Controls */}
            <div className="md:col-span-6 space-y-4">
              {/* Provider Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0B1B3A] mb-2">
                  1. Select Destination Network
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleProviderChange('linkedin')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedProvider === 'linkedin'
                        ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-bold text-blue-800">LinkedIn</div>
                    <div className="text-[10px] text-slate-500">Company Page</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleProviderChange('meta_facebook')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedProvider === 'meta_facebook'
                        ? 'border-indigo-600 bg-indigo-50/70 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-bold text-indigo-800">Facebook</div>
                    <div className="text-[10px] text-slate-500">Official Page</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleProviderChange('meta_instagram')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedProvider === 'meta_instagram'
                        ? 'border-rose-600 bg-rose-50/70 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-bold text-rose-800">Instagram</div>
                    <div className="text-[10px] text-slate-500">Professional</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleProviderChange('x_twitter')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedProvider === 'x_twitter'
                        ? 'border-slate-900 bg-slate-100 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900">X (Twitter)</div>
                    <div className="text-[10px] text-slate-500">Feed Post</div>
                  </button>
                </div>
              </div>

              {/* Connected Account Select */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0B1B3A] mb-1.5">
                  2. Target Account
                </label>
                {availableAccounts.length > 0 ? (
                  <select
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {availableAccounts.map((acc) => (
                      <option key={acc.account_id} value={acc.account_id}>
                        {acc.display_name} ({acc.account_handle}) • {acc.status.toUpperCase()}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-xs text-slate-500 text-center">
                    No account connected for {selectedProvider}. Connect one in Social Accounts.
                  </div>
                )}
              </div>

              {/* Channel-Specific Caption */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0B1B3A]">
                    3. Post Text & Channel Variant
                  </label>
                  <span
                    className={`text-[11px] font-mono ${
                      isOverLimit ? 'text-rose-600 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {totalLength} / {currentLimit} chars
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full text-xs font-sans p-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Hashtags */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0B1B3A] mb-1">
                  Hashtags
                </label>
                <input
                  type="text"
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl font-mono text-purple-700"
                />
              </div>

              {/* Action Mode: Publish Now vs Schedule */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0B1B3A] mb-2">
                  4. Publishing Schedule
                </label>
                <div className="flex items-center gap-3 mb-3">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="pubmode"
                      checked={publishMode === 'now'}
                      onChange={() => setPublishMode('now')}
                      className="text-purple-600"
                    />
                    <span>Publish Immediately</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="pubmode"
                      checked={publishMode === 'schedule'}
                      onChange={() => setPublishMode('schedule')}
                      className="text-purple-600"
                    />
                    <span>Schedule for Later</span>
                  </label>
                </div>

                {publishMode === 'schedule' && (
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-purple-50/50 border border-purple-200">
                    <div>
                      <span className="block text-[10px] font-bold uppercase text-purple-900 mb-1">
                        Date & Time
                      </span>
                      <input
                        type="datetime-local"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="w-full text-xs p-1.5 bg-white border border-purple-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold uppercase text-purple-900 mb-1">
                        Timezone
                      </span>
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full text-xs p-1.5 bg-white border border-purple-300 rounded-lg"
                      >
                        <option value="UTC">UTC (Universal Time)</option>
                        <option value="Asia/Kolkata">IST (Asia/Kolkata)</option>
                        <option value="America/New_York">EST (America/New York)</option>
                        <option value="America/Los_Angeles">PST (America/Los Angeles)</option>
                        <option value="Europe/London">GMT (Europe/London)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Live Feed Card Mockup */}
            <div className="md:col-span-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Live Feed Post Preview ({selectedProvider.replace('_', ' ')})
                </span>
                <span className="text-[10px] text-slate-400">Audience View</span>
              </div>

              {/* Feed Card Mockup */}
              <div className="bg-white border border-slate-300 rounded-2xl shadow-sm overflow-hidden text-xs">
                {/* Provider Header Bar */}
                <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-xs">
                      L
                    </div>
                    <div>
                      <div className="font-bold text-[#0B1B3A]">
                        {selectedAccount?.display_name || 'Lumora Fitness Official'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {selectedAccount?.account_handle || '@lumorafit'} • Just now
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                    {selectedProvider}
                  </span>
                </div>

                {/* Post Body */}
                <div className="p-4 space-y-3">
                  <p className="font-sans text-slate-800 whitespace-pre-wrap leading-relaxed text-xs">
                    {caption || <span className="italic text-slate-400">No caption entered...</span>}
                  </p>

                  {hashtags && (
                    <p className="font-mono text-purple-700 text-[11px]">{hashtags}</p>
                  )}

                  {/* Attached Media Asset Preview */}
                  {version.media && version.media.length > 0 && (
                    <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 max-h-48">
                      {version.media[0].url ? (
                        <img
                          src={version.media[0].url}
                          alt={version.media[0].alt_text || 'Media preview'}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="h-32 flex items-center justify-center text-slate-400 gap-1.5">
                          <ImageIcon className="w-5 h-5" />
                          <span>Attached: {version.media[0].name}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Simulated Social Reaction Bar */}
                <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between text-[11px] text-slate-500">
                  <span>👍 Like</span>
                  <span>💬 Comment</span>
                  <span>🔁 Repost</span>
                  <span>📤 Share</span>
                </div>
              </div>

              {/* Brand Governance Assurance */}
              <div className="p-3 rounded-xl bg-[#FBFAF7] border border-[#E8E4DC] text-[11px] text-slate-600 space-y-1">
                <div className="font-bold text-[#0B1B3A] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span>Audit Trail Assurance</span>
                </div>
                <p>
                  Published posts are recorded with provider post IDs, exact approved content versions,
                  and actor timestamps in the tenant audit log.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleExecutePublish}
            disabled={isSubmitting || !isApproved || isOverLimit || !selectedAccountId}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                <span>Broadcasting to {selectedProvider}...</span>
              </>
            ) : publishMode === 'now' ? (
              <>
                <Send className="w-4 h-4" />
                <span>Publish Now to {selectedProvider.replace('_', ' ')}</span>
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4" />
                <span>Schedule for {timezone}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
