import React, { useState, useRef } from 'react';

function PostModal({ open, onClose, onSubmit, user = { avatar: 'https://i.pravatar.cc/40', username: 'username' } }) {
  const [value, setValue] = useState('');
  const [image, setImage] = useState(null);
  const [gif, setGif] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const imageInputRef = useRef();
  const gifInputRef = useRef();

  if (!open) return null;

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleGifChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setGif(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handlePollClick = () => {
    alert('Poll creation coming soon!');
  };

  const handlePost = async () => {
    setError('');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ content: value }),
      });
      const data = await res.json();
      if (res.ok) {
        setValue(''); setImage(null); setGif(null);
        onSubmit?.(data); // Pass the new post to the parent
        onClose();
      } else {
        setError(data.message || 'Failed to create post');
      }
    } catch (err) {
      setError('Failed to create post');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
      <div className="bg-neutral-900 rounded-3xl shadow-2xl w-full max-w-xl border border-neutral-800 relative flex flex-col overflow-hidden animate-fade-in">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-neutral-400 hover:text-white text-2xl focus:outline-none"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        {/* Modal Content */}
        <div className="flex flex-col p-8 pt-10 gap-4">
          {error && <div className="text-red-400 text-center mb-2">{error}</div>}
          <textarea
            className="w-full h-28 p-3 rounded-xl bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-600 resize-none text-base placeholder-neutral-500"
            placeholder="Start a thread..."
            value={value}
            onChange={e => setValue(e.target.value)}
            maxLength={500}
            style={{ minHeight: 80 }}
          />
          {/* Preview uploaded image/gif */}
          {(image || gif) && (
            <div className="mt-4 flex gap-3">
              {image && <img src={image} alt="uploaded" className="max-h-40 rounded-2xl border border-neutral-700 shadow-md object-cover" />}
              {gif && <img src={gif} alt="uploaded gif" className="max-h-40 rounded-2xl border border-neutral-700 shadow-md object-cover" />}
            </div>
          )}
        </div>
        {/* Bottom Bar */}
        <div className="flex justify-between items-center gap-2 px-8 py-5 border-t border-neutral-800 bg-neutral-900 rounded-b-3xl">
          <div className="flex items-center gap-2">
            {/* Upload buttons */}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={imageInputRef}
              onChange={handleImageChange}
            />
            <button
              className="text-neutral-400 hover:text-white text-xl px-2 focus:outline-none"
              title="Upload image"
              onClick={() => imageInputRef.current.click()}
            >
              <span role="img" aria-label="Upload image">🖼️</span>
            </button>
            <input
              type="file"
              accept="image/gif"
              className="hidden"
              ref={gifInputRef}
              onChange={handleGifChange}
            />
            <button
              className="text-neutral-400 hover:text-white text-xl px-2 focus:outline-none"
              title="Upload GIF"
              onClick={() => gifInputRef.current.click()}
            >
              <span className="font-bold text-xs align-middle">GIF</span>
            </button>
            <button
              className="text-neutral-400 hover:text-white text-xl px-2 focus:outline-none"
              title="Create poll"
              onClick={handlePollClick}
            >
              <span role="img" aria-label="Create poll">📊</span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-neutral-500">{value.length}/500</span>
            <button
              className="px-6 py-2 rounded-full bg-white text-neutral-900 font-semibold hover:bg-neutral-200 transition disabled:opacity-50 shadow-sm"
              onClick={handlePost}
              disabled={!value.trim() || loading}
            >
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
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

export default PostModal; 