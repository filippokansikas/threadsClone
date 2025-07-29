import React, { useEffect, useState } from 'react';

function SendPostToUserModal({ isOpen, onClose, post, onUserSelect }) {
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchFollowing();
    }
  }, [isOpen]);

  const fetchFollowing = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/following', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setFollowing(data);
    } catch (error) {
      setFollowing([]);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-md border border-neutral-800 p-6 relative flex flex-col">
        <button
          className="absolute top-3 right-3 text-neutral-400 hover:text-white text-2xl focus:outline-none"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-xl font-bold text-white mb-4">Send Post in Chat</h2>
        {loading ? (
          <div className="text-neutral-400 text-center">Loading...</div>
        ) : following.length === 0 ? (
          <div className="text-neutral-400 text-center">You are not following anyone.</div>
        ) : (
          <div className="flex flex-col gap-3 max-h-80 overflow-y-auto">
            {following.map(user => (
              <button
                key={user.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-800 transition-colors text-left"
                onClick={() => onUserSelect(user)}
              >
                <img src={user.profilePicture || 'https://i.pravatar.cc/100'} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                <span className="text-white font-semibold">@{user.username}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SendPostToUserModal; 