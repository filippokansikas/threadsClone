import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import './App.css'
import Navbar from './Navbar'
import PostCard from './PostCard'
import RepostCard from './RepostCard'
import PostModal from './PostModal'
import SearchModal from './SearchModal'
import Notifications from './Notifications'
import CommentModal from './CommentModal'
import Profile from './Profile'
import Login from './Login'
import Register from './Register'
import { NotificationProvider } from './NotificationContext'

function Feed({ onCommentClick }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('foryou');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const fetchPosts = async (tabType = tab) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = tabType === 'following' ? '/api/posts/following' : '/api/posts';
      const res = await fetch(url, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (res.ok) {
        setPosts(data);
      } else {
        setPosts([]);
      }
    } catch {
      setPosts([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line
  }, [tab]);

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

  // Follow/unfollow logic
  const [following, setFollowing] = useState([]);
  useEffect(() => {
    const fetchFollowing = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch('/api/auth/following', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setFollowing(data.map(u => u.id));
    };
    fetchFollowing();
  }, [user]);

  const handleFollow = async (userId) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    await fetch(`/api/auth/follow/${userId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    setFollowing(f => [...f, userId]);
    if (tab === 'following') fetchPosts('following');
  };
  const handleUnfollow = async (userId) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    await fetch(`/api/auth/unfollow/${userId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    setFollowing(f => f.filter(id => id !== userId));
    if (tab === 'following') fetchPosts('following');
  };

  return (
    <div style={{ marginLeft: '5.5rem' }}>
      <div className="flex gap-4 mb-6 mt-4">
        <button
          className={`px-4 py-2 rounded-full font-semibold ${tab === 'foryou' ? 'bg-white text-black' : 'bg-neutral-800 text-white'}`}
          onClick={() => setTab('foryou')}
        >
          For you
        </button>
        <button
          className={`px-4 py-2 rounded-full font-semibold ${tab === 'following' ? 'bg-white text-black' : 'bg-neutral-800 text-white'}`}
          onClick={() => setTab('following')}
        >
          Following
        </button>
      </div>
      {error && <div className="text-red-400 text-center mb-2">{error}</div>}
      {loading ? (
        <div className="text-neutral-500 text-center mt-16">Loading posts...</div>
      ) : posts.length === 0 ? (
        <div className="text-neutral-500 text-center mt-16">No posts have been published yet.</div>
      ) : (
        posts.map((item, idx) => {
          if (item.type === 'post') {
            const post = item.data;
            const isFollowing = post.User && following.includes(post.User.id);
            const isOwn = user && post.User && post.User.id === user.id;
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
                  const postIndex = newPosts.findIndex(p => p.type === 'post' && p.data.id === post.id);
                  if (postIndex !== -1) {
                    newPosts[postIndex] = { ...newPosts[postIndex], data: { ...newPosts[postIndex].data, likes: data.post.likes } };
                  }
                  return newPosts;
                });
              }
            };
            return (
              <PostCard
                key={`post-${post.id}-${idx}`}
                avatar={post.User?.profilePicture || 'https://i.pravatar.cc/100'}
                username={post.User?.username}
                time={new Date(post.createdAt).toLocaleString()}
                content={post.content}
                onCommentClick={() => onCommentClick(post)}
                showDropdown={isOwn}
                onDropdownClick={() => handleDropdown(post.id)}
                dropdownOpen={dropdownOpen === post.id}
                onDelete={() => handleDelete(post.id)}
                deleting={deleting === post.id}
                showFollowButton={user && post.User && post.User.id !== user.id}
                isFollowing={isFollowing}
                onFollow={() => handleFollow(post.User.id)}
                onUnfollow={() => handleUnfollow(post.User.id)}
                isOwn={isOwn}
                likesCount={likesCount}
                liked={liked}
                onLike={handleLike}
                postId={post.id}
                user={user}
              />
            );
          } else if (item.type === 'repost') {
            const repost = item.data;
            const originalPost = repost.originalPost;
            const isFollowing = originalPost.User && following.includes(originalPost.User.id);
            const isOwn = user && originalPost.User && originalPost.User.id === user.id;
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
                setPosts(posts => {
                  const newPosts = [...posts];
                  const postIndex = newPosts.findIndex(p => p.type === 'repost' && p.data.originalPost.id === originalPost.id);
                  if (postIndex !== -1) {
                    newPosts[postIndex] = { 
                      ...newPosts[postIndex], 
                      data: { 
                        ...newPosts[postIndex].data, 
                        originalPost: { ...newPosts[postIndex].data.originalPost, likes: data.post.likes } 
                      } 
                    };
                  }
                  return newPosts;
                });
              }
            };
            return (
              <RepostCard
                key={`repost-${repost.id}-${idx}`}
                repost={repost}
                originalPost={originalPost}
                onCommentClick={() => onCommentClick(originalPost)}
                showDropdown={isOwn}
                onDropdownClick={() => handleDropdown(originalPost.id)}
                dropdownOpen={dropdownOpen === originalPost.id}
                onDelete={() => handleDelete(originalPost.id)}
                deleting={deleting === originalPost.id}
                showFollowButton={user && originalPost.User && originalPost.User.id !== user.id}
                isFollowing={isFollowing}
                onFollow={() => handleFollow(originalPost.User.id)}
                onUnfollow={() => handleUnfollow(originalPost.User.id)}
                isOwn={isOwn}
                likesCount={likesCount}
                liked={liked}
                onLike={handleLike}
                postId={originalPost.id}
                user={user}
              />
            );
          }
          return null;
        })
      )}
    </div>
  );
}

function App() {
  const [commentModal, setCommentModal] = useState({ open: false, post: null })
  const [profileRefresh, setProfileRefresh] = useState(0);
  return (
    <NotificationProvider>
      <BrowserRouter>
        <RouterApp
          commentModal={commentModal}
          setCommentModal={setCommentModal}
          profileRefresh={profileRefresh}
          setProfileRefresh={setProfileRefresh}
        />
      </BrowserRouter>
    </NotificationProvider>
  )
}

function RouterApp({ commentModal, setCommentModal, profileRefresh, setProfileRefresh }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleCommentClick = (post) => setCommentModal({ open: true, post })
  const handleCommentModalClose = () => setCommentModal({ open: false, post: null })

  // Modal routes
  const isPostModal = location.pathname === '/post';
  const isSearchModal = location.pathname === '/search';
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';

  // Handler to refresh profile after a new post
  const handlePostCreated = () => setProfileRefresh(r => r + 1);

  if (isAuthRoute) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    );
  }

  return (
    <>
      <Navbar />
      {isPostModal && (
        <PostModal open={true} onClose={() => navigate(-1)} onSubmit={handlePostCreated} />
      )}
      {isSearchModal && (
        <SearchModal open={true} onClose={() => navigate(-1)} />
      )}
      <CommentModal open={commentModal.open} onClose={handleCommentModalClose} post={commentModal.post} />
      <Routes>
        <Route path="/" element={<Feed onCommentClick={handleCommentClick} />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile onPostCreated={handlePostCreated} key={profileRefresh} />} />
        <Route path="/post" element={null} />
        <Route path="/search" element={null} />
      </Routes>
    </>
  )
}

export default App
