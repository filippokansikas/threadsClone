import React, { useEffect, useState, useCallback } from 'react';
import PostCard from './PostCard';
import RepostCard from './RepostCard';

function Profile({ onPostCreated }) {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [reposts, setReposts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'reposts'

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
        // Filter posts created by the logged-in user from the new API format
        const userPosts = data
          .filter(item => item.type === 'post' && item.data.User && Number(item.data.User.id) === Number(user.id))
          .map(item => item.data);
        setPosts(userPosts);
        
        // Filter reposts by the logged-in user
        const userReposts = data
          .filter(item => item.type === 'repost' && item.data.reposter && Number(item.data.reposter.id) === Number(user.id));
        setReposts(userReposts);
      } else {
        setPosts([]);
        setReposts([]);
      }
    } catch (err) {
      setPosts([]);
      setReposts([]);
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
      
      {/* Tabs */}
      <div className="w-full max-w-xl px-4 mb-6">
        <div className="flex gap-4">
          <button
            className={`px-4 py-2 rounded-full font-semibold ${activeTab === 'posts' ? 'bg-white text-black' : 'bg-neutral-800 text-white'}`}
            onClick={() => setActiveTab('posts')}
          >
            Posts ({posts.length})
          </button>
          <button
            className={`px-4 py-2 rounded-full font-semibold ${activeTab === 'reposts' ? 'bg-white text-black' : 'bg-neutral-800 text-white'}`}
            onClick={() => setActiveTab('reposts')}
          >
            Reposts ({reposts.length})
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="w-full max-w-xl px-2 sm:px-0">
        {error && <div className="text-red-400 text-center mb-2">{error}</div>}
        {loading ? (
          <div className="text-neutral-500 text-center mt-16">Loading your {activeTab}...</div>
        ) : activeTab === 'posts' ? (
          posts.length === 0 ? (
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
                    const postIndex = newPosts.findIndex(p => p.id === post.id);
                    if (postIndex !== -1) {
                      newPosts[postIndex] = { ...newPosts[postIndex], likes: data.post.likes };
                    }
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
          )
        ) : (
          // Reposts tab
          reposts.length === 0 ? (
            <div className="text-neutral-500 text-center mt-16">You haven't reposted any threads yet.</div>
          ) : (
            reposts.map((item, idx) => {
              const repost = item.data;
              const originalPost = repost.originalPost;
              const likes = Array.isArray(originalPost.likes) ? originalPost.likes.map(String) : [];
              const liked = user && likes.includes(String(user.id));
              const likesCount = likes.length;
              
              const handleLike = async (e) => {
                if (e && e.preventDefault) e.preventDefault();
                const token = localStorage.getItem('token');
                if (!token) return;
                const res = await fetch(`/api/posts/${originalPost.id}/like`, {
                  method: 'POST',
                  headers: { 'Authorization': `Bearer ${token}` },
                });
                if (res.ok) {
                  const data = await res.json();
                  setReposts(reposts => {
                    const newReposts = [...reposts];
                    const repostIndex = newReposts.findIndex(r => r.data.originalPost.id === originalPost.id);
                    if (repostIndex !== -1) {
                      newReposts[repostIndex] = { 
                        ...newReposts[repostIndex], 
                        data: { 
                          ...newReposts[repostIndex].data, 
                          originalPost: { ...newReposts[repostIndex].data.originalPost, likes: data.post.likes } 
                        } 
                      };
                    }
                    return newReposts;
                  });
                }
              };

              return (
                <RepostCard
                  key={`repost-${repost.id}-${idx}`}
                  repost={repost}
                  originalPost={originalPost}
                  showDropdown={false} // Users can't delete reposts from their profile
                  onDropdownClick={() => {}}
                  dropdownOpen={false}
                  onDelete={() => {}}
                  deleting={false}
                  likesCount={likesCount}
                  liked={liked}
                  onLike={handleLike}
                  postId={originalPost.id}
                  user={user}
                />
              );
            })
          )
        )}
      </div>
    </div>
  );
}

export default Profile; 