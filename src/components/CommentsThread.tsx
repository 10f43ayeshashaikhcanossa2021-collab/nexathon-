import React, { useState, useEffect } from 'react';
import { User, ReviewComment } from '../types/inkloom';
import { api } from '../api/client';
import { MessageSquare, Send, User as UserIcon, CornerDownRight } from 'lucide-react';

interface CommentsThreadProps {
  submissionId: string;
  versionId: string;
  currentUser: User;
}

export const CommentsThread: React.FC<CommentsThreadProps> = ({
  submissionId,
  versionId,
  currentUser,
}) => {
  const [comments, setComments] = useState<ReviewComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyToId, setReplyToId] = useState<string | null>(null);

  useEffect(() => {
    loadComments();
  }, [submissionId]);

  const loadComments = async () => {
    try {
      const list = await api.getComments(submissionId);
      setComments(list);
    } catch (err) {
      console.error('Failed to load comments', err);
    }
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await api.addComment({
        submissionId,
        versionId,
        body: newComment.trim(),
        parentCommentId: replyToId || undefined,
      });
      setNewComment('');
      setReplyToId(null);
      await loadComments();
    } catch (err: any) {
      alert(err.message || 'Failed to post feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'reviewer':
        return 'bg-teal-100 text-[#0d706b] border-teal-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="bg-white border border-[#D5DBE5] rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-teal-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#0B1B3A]">
            Collaboration Thread & Review Notes
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
          {comments.length} {comments.length === 1 ? 'note' : 'notes'}
        </span>
      </div>

      {/* Comments List */}
      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {comments.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            No collaboration notes yet. Reviewers and creators can exchange notes and feedback here.
          </div>
        ) : (
          comments.map((comm) => (
            <div
              key={comm.comment_id}
              className={`p-3 rounded-xl border text-xs transition-colors ${
                comm.author_id === currentUser.user_id
                  ? 'bg-teal-50/50 border-teal-100 ml-4'
                  : 'bg-slate-50/70 border-slate-200 mr-4'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#0B1B3A] text-white flex items-center justify-center text-[10px] font-bold uppercase">
                    {comm.author_name[0]}
                  </div>
                  <span className="font-bold text-[#0B1B3A] text-xs">{comm.author_name}</span>
                  <span
                    className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border ${getRoleBadge(
                      comm.author_role
                    )}`}
                  >
                    {comm.author_role}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">
                  {new Date(comm.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p className="text-slate-700 leading-relaxed text-xs pl-7">{comm.body}</p>
            </div>
          ))
        )}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSendComment} className="pt-2 border-t border-slate-100 space-y-2">
        {replyToId && (
          <div className="flex items-center justify-between bg-slate-100 px-2 py-1 rounded text-[11px] text-slate-600">
            <span className="flex items-center gap-1">
              <CornerDownRight className="w-3 h-3" /> Replying to comment
            </span>
            <button
              type="button"
              onClick={() => setReplyToId(null)}
              className="text-slate-400 hover:text-slate-700 font-bold"
            >
              ×
            </button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={`Add a comment as ${currentUser.full_name}...`}
            className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="px-3.5 py-2 rounded-xl bg-[#139A93] hover:bg-[#0D706B] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </div>
      </form>
    </div>
  );
};
