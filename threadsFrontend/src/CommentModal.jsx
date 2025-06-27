import React, { useState } from 'react';
import PostCard from './PostCard';

const sampleComments = [
  {
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
    username: 'commenter1',
    time: '1m',
    content: 'Welcome to Threads! 🎉',
  },
  {
    avatar: 'https://randomuser.me/api/portraits/women/55.jpg',
    username: 'commenter2',
    time: '3m',
    content: 'I love this post!'
  },
  {
    avatar: 'https://randomuser.me/api/portraits/men/66.jpg',
    username: 'commenter3',
    time: '10m',
    content: 'Great thoughts!'
  },
];

function CommentModal({ open, onClose, post, comments = sampleComments, onAddComment }) {
  const [value, setValue] = useState('');
  if (!open) return null;

  const handleSubmit = () => {
    if (value.trim()) {
      onAddComment?.(value);
      setValue('');
    }
  };

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
            <PostCard {...post} />
          </div>
        )}
        {/* Comments below, left-aligned to modal */}
        <div className="flex-1 overflow-y-auto px-6 pb-4 pt-2">
          {comments.length === 0 ? (
            <div className="text-neutral-500 text-center mt-8">No comments yet.</div>
          ) : (
            comments.map((comment, idx) => (
              <div key={idx} className="flex gap-3 mb-4 items-start bg-neutral-800 rounded-xl p-3 border border-neutral-700 shadow-sm">
                <img src={comment.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-white text-sm">{comment.username}</span>
                    <span className="text-xs text-neutral-400">· {comment.time}</span>
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
          />
          <button
            className="px-5 py-2 rounded-full bg-white text-neutral-900 font-semibold hover:bg-neutral-200 transition disabled:opacity-50"
            onClick={handleSubmit}
            disabled={!value.trim()}
          >
            Comment
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