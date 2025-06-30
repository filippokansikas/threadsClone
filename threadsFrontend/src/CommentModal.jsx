import React, { useState, useEffect } from 'react';
import PostCard from './PostCard';

function CommentModal({ open, onClose, post }) {
  const [comments, setComments] = useState([]);
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && post && post.id) {
      fetchComments();
    } else {
      setComments([]);
    }
    // eslint-disable-next-line
  }, [open, post]);

  const fetchComments = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/posts/${post.id}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      } else {
        setError('Failed to load comments');
      }
    } catch (err) {
      setError('Failed to load comments');
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!value.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/posts/${post.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: value.trim() })
      });
      if (res.ok) {
        setValue('');
        await fetchComments();
      } else {
        setError('Failed to add comment');
      }
    } catch (err) {
      setError('Failed to add comment');
    }
    setSubmitting(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
      <div className="bg-neutral-900 rounded-3xl shadow-2xl w-full max-w-xl border border-neutral-800 relative flex flex-col overflow-hidden animate-fade-in">
        {/* Sticky Header with Close Button */}
        <div className="sticky top-0 z-10 w-full bg-neutral-900/90 backdrop-blur border-b border-neutral-800 flex items-center justify-between px-6 py-4">
          <span className="text-lg font-semibold text-white">Comments</span>
          <button
            className="text-neutral-400 hover:text-white text-2xl focus:outline-none"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        {/* Post at the top */}
        {post && (
          <div className="px-6 pt-6 pb-2">
            <PostCard
              avatar={post.User?.profilePicture || 'https://i.pravatar.cc/100'}
              username={post.User?.username}
              time={new Date(post.createdAt).toLocaleString()}
              content={post.content}
              postId={post.id}
              user={post.User}
              post={post}
              // Disable actions in modal header
              showDropdown={false}
              showFollowButton={false}
              isOwn={false}
              likesCount={Array.isArray(post.likes) ? post.likes.length : 0}
              liked={false}
              onLike={() => {}}
              onCommentClick={() => {}}
              onRepostUpdate={() => {}}
            />
          </div>
        )}
        {/* Comments below, left-aligned to modal */}
        <div className="flex-1 overflow-y-auto px-6 pb-4 pt-2">
          {loading ? (
            <div className="text-neutral-500 text-center mt-8">Loading comments...</div>
          ) : error ? (
            <div className="text-red-400 text-center mt-8">{error}</div>
          ) : comments.length === 0 ? (
            <div className="text-neutral-500 text-center mt-8">No comments yet.</div>
          ) : (
            comments.map((comment, idx) => (
              <div key={comment.id || idx} className="flex gap-3 mb-4 items-start bg-neutral-800 rounded-xl p-3 border border-neutral-700 shadow-sm">
                <img src={comment.User?.profilePicture || 'https://i.pravatar.cc/100'} alt="avatar" className="w-8 h-8 rounded-full object-cover mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-white text-sm">{comment.User?.username || 'Unknown'}</span>
                    <span className="text-xs text-neutral-400">· {new Date(comment.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="text-neutral-200 text-sm text-left">{comment.content}</div>
                </div>
              </div>
            ))
          )}
        </div>
        {/* Add Comment */}
        <div className="flex items-end gap-2 px-6 py-5 border-t border-neutral-800 bg-neutral-900 rounded-b-3xl">
          <textarea
            className="flex-1 p-3 rounded-xl bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-600 resize-none text-base placeholder-neutral-500"
            placeholder="Write a comment..."
            value={value}
            onChange={e => setValue(e.target.value)}
            rows={2}
            maxLength={300}
            disabled={submitting}
          />
          <button
            className="px-5 py-2 rounded-full bg-white text-neutral-900 font-semibold hover:bg-neutral-200 transition disabled:opacity-50"
            onClick={handleSubmit}
            disabled={!value.trim() || submitting}
          >
            {submitting ? 'Posting...' : 'Comment'}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.2s ease; }
      `}</style>
    </div>
  );
}

export default CommentModal; 