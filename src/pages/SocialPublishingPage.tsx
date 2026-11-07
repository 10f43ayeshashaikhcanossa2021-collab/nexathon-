import React, { useState, useEffect } from 'react';
import {
  User,
  SocialAccount,
  PublishJob,
  PublishResult,
  ContentSubmission,
  ContentVersion,
  SocialProvider,
} from '../types/inkloom';
import { api } from '../api/client';
import { store } from '../services/store';
import { SocialPublishModal } from '../components/SocialPublishModal';
import {
  Share2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Plus,
  Trash2,
  RefreshCw,
  Send,
  Layers,
  ShieldCheck,
  X,
  FileCheck2,
  Sparkles,
  Link as LinkIcon,
  Filter,
} from 'lucide-react';

interface SocialPublishingPageProps {
  currentUser: User;
  onNavigate: (page: string, params?: any) => void;
  pageParams?: any;
}

export const SocialPublishingPage: React.FC<SocialPublishingPageProps> = ({
  currentUser,
  onNavigate,
  pageParams,
}) => {
  const [activeTab, setActiveTab] = useState<'queue' | 'approved' | 'accounts' | 'history'>('queue');
  const [accounts, setAccounts] = useState<SocialAccount[]>(() => store.getSocialAccounts());
  const [jobs, setJobs] = useState<PublishJob[]>(() => store.getPublishJobs());
  const [results, setResults] = useState<PublishResult[]>(() => store.getPublishResults());

  // Filter for jobs
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Connect Account Modal
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [newAccProvider, setNewAccProvider] = useState<SocialProvider>('linkedin');
  const [newAccName, setNewAccName] = useState('');
  const [newAccHandle, setNewAccHandle] = useState('');

  // Publish from Approved Content Modal
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [activeSubmission, setActiveSubmission] = useState<ContentSubmission | null>(null);
  const [activeVersion, setActiveVersion] = useState<ContentVersion | null>(null);

  const isAdmin = currentUser.role === 'admin';

  // Approved submissions list
  const approvedSubmissions = store.submissions.filter((s) => s.status === 'approved');

  const reloadData = () => {
    setAccounts([...store.getSocialAccounts()]);
    setJobs([...store.getPublishJobs()]);
    setResults([...store.getPublishResults()]);
  };

  const handleOpenPublish = (sub: ContentSubmission) => {
    const ver = store.getLatestVersion(sub.submission_id);
    if (!ver) return;
    setActiveSubmission(sub);
    setActiveVersion(ver);
    setIsPublishModalOpen(true);
  };

  const handleConnectAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName.trim()) return;

    await api.connectSocialAccount({
      provider: newAccProvider,
      displayName: newAccName.trim(),
      handle: newAccHandle.trim() || undefined,
    });

    reloadData();
    setIsConnectModalOpen(false);
    setNewAccName('');
    setNewAccHandle('');
  };

  const handleDisconnect = async (id: string) => {
    if (confirm('Disconnect this social media channel? Scheduled posts will require reconnection.')) {
      await api.disconnectSocialAccount(id);
      reloadData();
    }
  };

  const handleCancelJob = async (jobId: string) => {
    if (confirm('Cancel this scheduled social media post?')) {
      await api.cancelPublishJob(jobId);
      reloadData();
    }
  };

  const handleRetryJob = async (jobId: string) => {
    await api.retryPublishJob(jobId);
    reloadData();
  };

  // Filtered jobs
  const filteredJobs = jobs.filter((j) => {
    if (statusFilter === 'all') return true;
    return j.status === statusFilter;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#0B1B3A]">Social Media Publishing</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
              Approved Content Broadcast
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Broadcast only human-approved brand content to Meta Facebook, Instagram, LinkedIn, and X with full audit tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {isAdmin && (
            <button
              type="button"
              onClick={() => setIsConnectModalOpen(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Connect Social Account</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#D5DBE5] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('queue')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'queue'
              ? 'bg-[#0B1B3A] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Publishing Calendar & Queue ({jobs.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('approved')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'approved'
              ? 'bg-[#0B1B3A] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileCheck2 className="w-4 h-4 text-emerald-400" />
          <span>Approved Content Ready to Broadcast ({approvedSubmissions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('accounts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'accounts'
              ? 'bg-[#0B1B3A] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Share2 className="w-4 h-4 text-purple-400" />
          <span>Connected Social Accounts ({accounts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'history'
              ? 'bg-[#0B1B3A] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4 text-sky-400" />
          <span>Broadcast Results & Audit ({results.length})</span>
        </button>
      </div>

      {/* TAB 1: QUEUE & SCHEDULED */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-slate-500 font-semibold">Filter by Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs p-1.5 bg-white border border-[#D5DBE5] rounded-xl focus:outline-none"
              >
                <option value="all">All States</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredJobs.map((job) => {
              const matchedResult = results.find((r) => r.job_id === job.job_id);
              return (
                <div
                  key={job.job_id}
                  className="bg-white border border-[#D5DBE5] rounded-2xl p-5 shadow-xs space-y-3 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-[#0B1B3A]">
                        {job.job_id}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200">
                        {job.provider.replace('_', ' ')}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          job.status === 'published'
                            ? 'bg-emerald-100 text-emerald-800'
                            : job.status === 'scheduled'
                            ? 'bg-blue-100 text-blue-800'
                            : job.status === 'cancelled'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {job.status}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[#0B1B3A]">{job.submission_title}</h4>
                    <p className="text-xs text-slate-600 line-clamp-2 italic font-sans">
                      "{job.caption}"
                    </p>

                    <div className="text-[11px] text-slate-400 flex items-center gap-3">
                      <span>Scheduled: {new Date(job.scheduled_time).toLocaleString()} ({job.timezone})</span>
                      <span>By: {job.created_by_name}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {matchedResult?.provider_url && (
                      <a
                        href={matchedResult.provider_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                      >
                        <span>View Live</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}

                    {job.status === 'scheduled' && (
                      <button
                        type="button"
                        onClick={() => handleCancelJob(job.job_id)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}

                    {job.status === 'failed' && (
                      <button
                        type="button"
                        onClick={() => handleRetryJob(job.job_id)}
                        className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Retry</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredJobs.length === 0 && (
              <div className="p-12 text-center bg-white border border-[#D5DBE5] rounded-2xl space-y-2">
                <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-sm font-bold text-[#0B1B3A]">No Scheduled Posts</h4>
                <p className="text-xs text-slate-500">
                  Select an approved submission from the "Approved Content" tab to schedule a broadcast.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: APPROVED CONTENT READY TO BROADCAST */}
      {activeTab === 'approved' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {approvedSubmissions.map((sub) => {
              const ver = store.getLatestVersion(sub.submission_id);
              return (
                <div
                  key={sub.submission_id}
                  className="bg-white border border-[#D5DBE5] rounded-2xl p-5 shadow-xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-[#0B1B3A]">
                        {sub.submission_id}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Approved
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[#0B1B3A]">{sub.title}</h4>
                    {ver && (
                      <p className="text-xs text-slate-600 line-clamp-3 font-serif bg-[#FBFAF7] p-3 rounded-xl border border-[#E8E4DC]">
                        "{ver.body_text}"
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Approved version v{ver?.version_no || 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenPublish(sub)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Publish / Schedule Post</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {approvedSubmissions.length === 0 && (
              <div className="col-span-2 p-12 text-center bg-white border border-[#D5DBE5] rounded-2xl space-y-2">
                <FileCheck2 className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-sm font-bold text-[#0B1B3A]">No Approved Submissions Yet</h4>
                <p className="text-xs text-slate-500">
                  Submissions must pass reviewer approval before they can be published to social media channels.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CONNECTED SOCIAL ACCOUNTS */}
      {activeTab === 'accounts' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {accounts.map((acc) => (
              <div
                key={acc.account_id}
                className="bg-white border border-[#D5DBE5] rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200">
                      {acc.provider.replace('_', ' ')}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        acc.status === 'connected'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {acc.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {acc.profile_picture_url ? (
                      <img
                        src={acc.profile_picture_url}
                        alt={acc.display_name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-xs">
                        {acc.display_name[0]}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#0B1B3A] truncate">
                        {acc.display_name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate">
                        {acc.account_handle}
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500 space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <strong>Account Type: </strong>
                      <span className="capitalize">{acc.account_type}</span>
                    </div>
                    <div>
                      <strong>Verified: </strong>
                      <span>{new Date(acc.last_verified_at).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <strong>Scopes: </strong>
                      <span className="font-mono">{acc.granted_scopes.join(', ')}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">{acc.account_id}</span>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => handleDisconnect(acc.account_id)}
                      className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                    >
                      {acc.status === 'connected' ? 'Disconnect' : 'Remove'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Setup Guidance Info Card */}
          <div className="p-5 rounded-2xl bg-[#FBFAF7] border border-[#E8E4DC] space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B1B3A]">
                Official Provider OAuth & Token Security Guidelines (Section 3.B)
              </h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              INKLOOM AI integrates directly via official Meta Graph API and LinkedIn REST APIs.
              Social provider access tokens and refresh tokens are handled and encrypted securely server-side;
              no credentials or passwords are ever exposed to browser storage.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600 pt-1">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <strong>LinkedIn:</strong> Requires <code className="font-mono text-[11px] text-purple-700">w_organization_social</code> scope.
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <strong>Meta Facebook:</strong> Requires <code className="font-mono text-[11px] text-purple-700">pages_manage_posts</code> scope.
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <strong>Instagram:</strong> Requires Professional account linked to Facebook Page.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PUBLISHING HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#D5DBE5] rounded-2xl overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0B1B3A]">
                Publishing Audit Records ({results.length})
              </h3>
              <span className="text-[11px] text-slate-400">Append-Only Immutable Broadcast Log</span>
            </div>

            <div className="divide-y divide-slate-100">
              {results.map((r) => (
                <div key={r.result_id} className="p-4 flex items-center justify-between gap-4 text-xs">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#0B1B3A]">{r.result_id}</span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200">
                        {r.provider.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {r.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 font-mono">
                      Job ID: {r.job_id} • Post ID: {r.provider_post_id || 'N/A'}
                    </div>

                    <div className="text-[11px] text-slate-400">
                      Published: {new Date(r.published_at).toLocaleString()}
                    </div>
                  </div>

                  {r.provider_url && (
                    <a
                      href={r.provider_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shrink-0"
                    >
                      <span>View Live Post</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ))}

              {results.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No social broadcasts have been recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Connect Account Modal */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <form
            onSubmit={handleConnectAccount}
            className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-[#0B1B3A]">Connect Social Media Channel</h3>
              <button
                type="button"
                onClick={() => setIsConnectModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                Social Platform
              </label>
              <select
                value={newAccProvider}
                onChange={(e) => setNewAccProvider(e.target.value as any)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl bg-slate-50"
              >
                <option value="linkedin">LinkedIn (Company / Member)</option>
                <option value="meta_facebook">Meta Facebook (Brand Page)</option>
                <option value="meta_instagram">Instagram (Professional Profile)</option>
                <option value="x_twitter">X / Twitter</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                Account / Page Display Name
              </label>
              <input
                type="text"
                placeholder="e.g. Lumora Fitness Global"
                value={newAccName}
                onChange={(e) => setNewAccName(e.target.value)}
                required
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                Handle or Page Tag
              </label>
              <input
                type="text"
                placeholder="e.g. @lumorafitness"
                value={newAccHandle}
                onChange={(e) => setNewAccHandle(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl font-mono"
              />
            </div>

            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-[11px] text-purple-900 leading-tight">
              <strong>Simulated OAuth 2.0 Authorization: </strong>
              Connecting registers the verified provider identity with standard publishing scopes.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setIsConnectModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newAccName.trim()}
                className="px-4 py-1.5 bg-purple-600 text-white text-xs font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                Authorize & Connect
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Publish Modal */}
      {isPublishModalOpen && activeSubmission && activeVersion && (
        <SocialPublishModal
          isOpen={isPublishModalOpen}
          onClose={() => setIsPublishModalOpen(false)}
          submission={activeSubmission}
          version={activeVersion}
          onPublishSuccess={() => reloadData()}
        />
      )}
    </div>
  );
};
