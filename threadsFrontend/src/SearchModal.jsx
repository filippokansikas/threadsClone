import React, { useState } from 'react';
import PostCard from './PostCard';

function SearchModal({ open, onClose, posts = [] }) {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  if (!open) return null;

  const filteredPosts = posts.filter(
    post =>
      post.content.toLowerCase().includes(query.toLowerCase()) ||
      (post.username && post.username.toLowerCase().includes(query.toLowerCase()))
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setShowResults(true);
    }
  };

  const handleClose = () => {
    setShowResults(false);
    setQuery('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
      {showResults ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-neutral-900">
          <div className="flex items-center justify-between px-8 py-6 border-b border-neutral-800">
            <span className="text-xl text-white font-semibold">Search results for "{query}"</span>
            <button
              className="text-neutral-400 hover:text-white text-2xl focus:outline-none"
              onClick={handleClose}
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-8 py-8">
            {filteredPosts.length === 0 ? (
              <div className="text-neutral-500 text-center mt-8">No results found.</div>
            ) : (
              filteredPosts.map((post, idx) => (
                <PostCard key={idx} {...post} />
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="bg-neutral-900 rounded-3xl shadow-2xl w-full max-w-xl border border-neutral-800 relative flex flex-col overflow-hidden animate-fade-in">
          {/* Close Button */}
          <button
            className="absolute top-4 right-4 text-neutral-400 hover:text-white text-2xl focus:outline-none"
            onClick={handleClose}
            aria-label="Close"
          >
            ×
          </button>
          {/* Search Input */}
          <div className="p-8 pt-10 pb-4">
            <input
              type="text"
              className="w-full p-3 rounded-xl bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-600 text-base placeholder-neutral-500"
              placeholder="Search posts..."
              value={query}
              onChange={e => { setQuery(e.target.value); setShowResults(false); }}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </div>
          <div className="flex-1 overflow-y-auto px-8 pb-8">
            <div className="text-neutral-500 text-center mt-8">Type your search and press Enter…</div>
          </div>
        </div>
      )}
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

export default SearchModal; 