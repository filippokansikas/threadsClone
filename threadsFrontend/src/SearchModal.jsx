import React, { useState } from 'react';
import PostCard from './PostCard';

function SearchModal({ open, onClose, user }) {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleKeyDown = async (e) => {
    if (e.key === 'Enter' && query.trim() !== '') {
      setShowResults(true);
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/posts/search?query=${encodeURIComponent(query)}`);
        if (!res.ok) {
          const data = await res.json();
          setError(data.message || 'Search failed');
          setResults([]);
        } else {
          const data = await res.json();
          setResults(data);
        }
      } catch (err) {
        setError('Search failed');
        setResults([]);
      }
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowResults(false);
    setQuery('');
    setResults([]);
    setError('');
    setLoading(false);
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
            {loading ? (
              <div className="text-neutral-500 text-center mt-8">Searching…</div>
            ) : error ? (
              <div className="text-red-400 text-center mt-8">{error}</div>
            ) : results.length === 0 ? (
              <div className="text-neutral-500 text-center mt-8">No results found.</div>
            ) : (
              results.map((post, idx) => (
                <PostCard
                  key={post.id || idx}
                  avatar={post.User?.profilePicture || 'https://i.pravatar.cc/100'}
                  username={post.User?.username || 'Unknown'}
                  time={new Date(post.createdAt).toLocaleString()}
                  content={post.content}
                  likesCount={Array.isArray(post.likes) ? post.likes.length : 0}
                  liked={user && Array.isArray(post.likes) ? post.likes.map(String).includes(String(user.id)) : false}
                  postId={post.id}
                  user={user}
                  onRepostUpdate={() => {}}
                  repostCount={typeof post.repostCount === 'number' ? post.repostCount : 0}
                />
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
              onChange={e => { setQuery(e.target.value); setShowResults(false); setResults([]); setError(''); }}
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