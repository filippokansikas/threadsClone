import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PostCard from './PostCard';
import RepostCard from './RepostCard';
import SettingsModal from './SettingsModal';

function Profile({ onPostCreated, profileRefresh, onCommentClick }) {
  const { username } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [reposts, setReposts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'reposts'
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Debug: Log when component mounts/unmounts
  useEffect(() => {
    console.log('Profile: Component mounted with profileRefresh:', profileRefresh, 'username:', username);
    return () => console.log('Profile: Component unmounting');
  }, [profileRefresh, username]);

  useEffect(() => {
    // Get user info from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const currentUser = JSON.parse(storedUser);
      setUser(currentUser);
      
      // Check if this is the user's own profile
      if (!username || username === currentUser.username) {
        setProfileUser(currentUser);
        setIsOwnProfile(true);
      } else {
        // Fetch other user's profile
        fetchUserProfile(username);
      }
    }
  }, [username]);

  // Always check follow status when profileUser or user changes
  useEffect(() => {
    if (profileUser && user && profileUser.id !== user.id) {
      checkFollowStatus(profileUser.id);
    }
  }, [profileUser, user]);

  const fetchUserProfile = async (targetUsername) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/users/${targetUsername}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      
      if (res.ok) {
        const userData = await res.json();
        setProfileUser(userData);
        setIsOwnProfile(false);
        
        // Check if current user is following this user
        if (user && user.id !== userData.id) {
          checkFollowStatus(userData.id);
        }
      } else if (res.status === 404) {
        navigate('/profile'); // Redirect to own profile if user not found
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      navigate('/profile');
    }
  };

  const checkFollowStatus = async (targetUserId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/following', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (res.ok) {
        const following = await res.json();
        setIsFollowing(following.some(u => u.id === targetUserId));
      }
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollow = async () => {
    if (!profileUser || !user) return;
    setFollowLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/auth/follow/${profileUser.id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        setIsFollowing(true);
        setFollowerCount(prev => prev + 1);
        await fetchFollowerCounts(); // Refresh counts
        checkFollowStatus(profileUser.id); // Ensure status is up to date
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
    setFollowLoading(false);
  };

  const handleUnfollow = async () => {
    if (!profileUser || !user) return;
    setFollowLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/auth/unfollow/${profileUser.id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        setIsFollowing(false);
        setFollowerCount(prev => Math.max(0, prev - 1));
        await fetchFollowerCounts(); // Refresh counts
        checkFollowStatus(profileUser.id); // Ensure status is up to date
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
    setFollowLoading(false);
  };

  const fetchFollowerCounts = useCallback(async () => {
    if (!profileUser) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Fetch followers count
      const followersResponse = await fetch(`/api/users/${profileUser.username}/followers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (followersResponse.ok) {
        const followers = await followersResponse.json();
        setFollowerCount(followers.length);
      }

      // Fetch following count
      const followingResponse = await fetch(`/api/users/${profileUser.username}/following`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (followingResponse.ok) {
        const following = await followingResponse.json();
        setFollowingCount(following.length);
      }
    } catch (error) {
      console.error('Error fetching follower counts:', error);
    }
  }, [profileUser]);

  const fetchPosts = useCallback(async () => {
    console.log('Profile: fetchPosts called, profileRefresh:', profileRefresh, 'profileUser:', profileUser);
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/posts', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (res.ok && profileUser) {
        // Filter posts created by the profile user from the new API format
        const userPosts = data
          .filter(item => item.type === 'post' && item.data.User && Number(item.data.User.id) === Number(profileUser.id))
          .map(item => item.data);
        setPosts(userPosts);
        
        // Filter reposts by the profile user
        const userReposts = data
          .filter(item => item.type === 'repost' && item.data.reposter && Number(item.data.reposter.id) === Number(profileUser.id));
        console.log('Profile: Found user reposts:', userReposts.length);
        setReposts(userReposts);
      } else {
        setPosts([]);
        setReposts([]);
      }
    } catch (err) {
      console.error('Profile: Error fetching posts:', err);
      setPosts([]);
      setReposts([]);
    }
    setLoading(false);
  }, [profileUser, profileRefresh]);

  // Force re-fetch whenever profileRefresh changes
  useEffect(() => {
    if (profileUser && profileRefresh) {
      console.log('Profile: profileRefresh changed, forcing re-fetch:', profileRefresh);
      fetchPosts();
      fetchFollowerCounts();
    }
  }, [profileRefresh, profileUser, fetchPosts, fetchFollowerCounts]);

  // Initial fetch when profileUser is loaded
  useEffect(() => {
    if (profileUser) {
      console.log('Profile: Initial fetch for user:', profileUser.id);
      fetchPosts();
      fetchFollowerCounts();
    }
  }, [profileUser, fetchPosts, fetchFollowerCounts]);

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

  // Handler for updating user after settings change
  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  if (!user) {
    return <div className="text-white text-center mt-16">You must be logged in to view your profile.</div>;
  }

  if (!profileUser) {
    return <div className="text-white text-center mt-16">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center pt-0 px-0">
      {/* Profile Header */}
      <div className="w-full max-w-xl flex flex-col items-center py-10 relative">
        {/* Settings Button - only show for own profile */}
        {isOwnProfile && (
          <button
            className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white"
            onClick={() => setSettingsOpen(true)}
            aria-label="Edit Profile Settings"
          >
            {/* Standard Gear Icon */}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.25 2.25c.966 0 1.75.784 1.75 1.75v.5a7.001 7.001 0 0 1 2.45.7l.35-.35a1.75 1.75 0 1 1 2.475 2.475l-.35.35a7.001 7.001 0 0 1 .7 2.45h.5c.966 0 1.75.784 1.75 1.75s-.784 1.75-1.75 1.75h-.5a7.001 7.001 0 0 1-.7 2.45l.35.35a1.75 1.75 0 1 1-2.475 2.475l-.35-.35a7.001 7.001 0 0 1-2.45.7v.5c0 .966-.784 1.75-1.75 1.75s-1.75-.784-1.75-1.75v-.5a7.001 7.001 0 0 1-2.45-.7l-.35.35a1.75 1.75 0 1 1-2.475-2.475l.35-.35a7.001 7.001 0 0 1-.7-2.45h-.5c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75h.5a7.001 7.001 0 0 1 .7-2.45l-.35-.35A1.75 1.75 0 1 1 6.8 4.65l.35.35a7.001 7.001 0 0 1 2.45-.7v-.5c0-.966.784-1.75 1.75-1.75zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
            </svg>
          </button>
        )}
        
        <img src={profileUser.profilePicture || 'https://i.pravatar.cc/100'} alt="avatar" className="w-24 h-24 rounded-full object-cover border-4 border-neutral-800 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-1">@{profileUser.username}</h1>
        <p className="text-neutral-400 text-center mb-4">{profileUser.bio}</p>
        
        {/* Follower/Following Counts */}
        <div className="flex gap-8 mb-4">
          <div className="text-center">
            <div className="text-white font-semibold text-lg">{followerCount}</div>
            <div className="text-neutral-400 text-sm">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-white font-semibold text-lg">{followingCount}</div>
            <div className="text-neutral-400 text-sm">Following</div>
          </div>
        </div>
        
        {/* Follow/Unfollow Button - only show for other users */}
        {!isOwnProfile && user && (
          <div className="mb-4">
            {isFollowing ? (
              <button
                onClick={handleUnfollow}
                className="px-6 py-2 bg-neutral-800 text-white rounded-full hover:bg-neutral-700 transition-colors disabled:opacity-50"
                disabled={followLoading}
              >
                {followLoading ? 'Unfollowing...' : 'Unfollow'}
              </button>
            ) : (
              <button
                onClick={handleFollow}
                className="px-6 py-2 bg-white text-black rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50"
                disabled={followLoading}
              >
                {followLoading ? 'Following...' : 'Follow'}
              </button>
            )}
          </div>
        )}
        
        <div className="w-full border-b border-neutral-800 mb-6"></div>
      </div>
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} user={user} onUpdate={handleUserUpdate} />
      
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
          <div className="text-neutral-500 text-center mt-16">Loading {isOwnProfile ? 'your' : `${profileUser.username}'s`} {activeTab}...</div>
        ) : activeTab === 'posts' ? (
          posts.length === 0 ? (
            <div className="text-neutral-500 text-center mt-16">
              {isOwnProfile ? "You haven't posted any threads yet." : `${profileUser.username} hasn't posted any threads yet.`}
            </div>
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
                  post={post}
                  onCommentClick={onCommentClick ? () => onCommentClick(post) : undefined}
                  commentCount={post.commentCount || 0}
                />
              );
            })
          )
        ) : (
          // Reposts tab
          reposts.length === 0 ? (
            <div className="text-neutral-500 text-center mt-16">
              {isOwnProfile ? "You haven't reposted any threads yet." : `${profileUser.username} hasn't reposted any threads yet.`}
            </div>
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
                  onRepostUpdate={() => fetchPosts()} // Refresh when repost status changes
                  post={originalPost}
                  onCommentClick={onCommentClick ? () => onCommentClick(originalPost) : undefined}
                  commentCount={originalPost.commentCount || 0}
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