import React, { useEffect, useState, useCallback } from 'react';
import PostCard from './PostCard';

function Profile({ onPostCreated }) {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(null); // Track which post's dropdown is open

  useEffect(() => {
    // Get user info from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/posts', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (res.ok && user) {
        // Only show posts created by the logged-in user (using post.User.id)
        const userPosts = data.filter(post => post.User && post.User.id === user.id);
        setPosts(userPosts);
      } else {
        setPosts([]);
      }
    } catch (err) {
      setPosts([]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) fetchPosts();
  }, [user, fetchPosts]);

  // Handler to refresh posts after a new post is created
  const handlePostCreated = () => {
    fetchPosts();
    if (onPostCreated) onPostCreated();
  };

  const handleDelete = async (postId) => {
    setDeleting(postId);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (res.ok) {
        fetchPosts();
      } else {
        setError(data.message || 'Failed to delete post');
      }
    } catch {
      setError('Failed to delete post');
    }
    setDeleting(null);
    setDropdownOpen(null);
  };

  const handleDropdown = (postId) => {
    setDropdownOpen(dropdownOpen === postId ? null : postId);
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest('.dropdown-menu') && !e.target.closest('.dropdown-trigger')) {
        setDropdownOpen(null);
      }
    };
    if (dropdownOpen !== null) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  if (!user) {
    return <div className="text-white text-center mt-16">You must be logged in to view your profile.</div>;
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center pt-0 px-0">
      {/* Profile Header */}
      <div className="w-full max-w-xl flex flex-col items-center py-10">
        <img src={user.profilePicture || 'https://i.pravatar.cc/100'} alt="avatar" className="w-24 h-24 rounded-full object-cover border-4 border-neutral-800 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-1">@{user.username}</h1>
        <p className="text-neutral-400 text-center mb-4">{user.bio}</p>
        <div className="w-full border-b border-neutral-800 mb-6"></div>
      </div>
      {/* User's Threads */}
      <div className="w-full max-w-xl px-2 sm:px-0">
        {error && <div className="text-red-400 text-center mb-2">{error}</div>}
        {loading ? (
          <div className="text-neutral-500 text-center mt-16">Loading your threads...</div>
        ) : posts.length === 0 ? (
          <div className="text-neutral-500 text-center mt-16">You haven't posted any threads yet.</div>
        ) : (
          posts.map((post, idx) => {
            const likes = Array.isArray(post.likes) ? post.likes.map(String) : [];
            const liked = user && likes.includes(String(user.id));
            const likesCount = likes.length;
            
            const handleLike = async (e) => {
              if (e && e.preventDefault) e.preventDefault();
              const token = localStorage.getItem('token');
              if (!token) return;
              const res = await fetch(`/api/posts/${post.id}/like`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
              });
              if (res.ok) {
                const data = await res.json();
                setPosts(posts => {
                  const newPosts = [...posts];
                  newPosts[idx] = { ...newPosts[idx], likes: data.post.likes };
                  return newPosts;
                });
              }
            };

            return (
              <PostCard
                key={post.id || idx}
                avatar={post.User?.profilePicture || 'https://i.pravatar.cc/100'}
                username={post.User?.username}
                time={new Date(post.createdAt).toLocaleString()}
                content={post.content}
                showDropdown={user && post.User && post.User.id === user.id}
                onDropdownClick={() => handleDropdown(post.id)}
                dropdownOpen={dropdownOpen === post.id}
                onDelete={() => handleDelete(post.id)}
                deleting={deleting === post.id}
                likesCount={likesCount}
                liked={liked}
                onLike={handleLike}
                postId={post.id}
                user={user}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

export default Profile; 