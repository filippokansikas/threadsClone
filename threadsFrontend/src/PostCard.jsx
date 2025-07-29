import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { repostPost, checkRepostStatus, getRepostCount } from './api'
import StartChatModal from './StartChatModal'
import SendPostToUserModal from './SendPostToUserModal'

function PostCard({
  avatar = 'https://i.pravatar.cc/40',
  username = 'username',
  time = '1h',
  content = 'This is a sample thread post. You can write anything here, just like on threads.com!',
  onCommentClick,
  showDropdown = false,
  onDropdownClick,
  dropdownOpen = false,
  onDelete,
  deleting = false,
  showFollowButton = false,
  isFollowing = false,
  onFollow,
  onUnfollow,
  isOwn = false,
  likesCount = 0,
  liked = false,
  onLike,
  postId,
  user,
  onRepostUpdate,
  post,
  commentCount = 0
}) {
  const navigate = useNavigate();
  const [reposted, setReposted] = useState(false);
  const [repostCount, setRepostCount] = useState(0);
  const [reposting, setReposting] = useState(false);
  const [showStartChatModal, setShowStartChatModal] = useState(false);
  const [showSendPostChatModal, setShowSendPostChatModal] = useState(false);
  const [showSendPostToUserModal, setShowSendPostToUserModal] = useState(false);
  const [selectedUserForPost, setSelectedUserForPost] = useState(null);

  useEffect(() => {
    if (postId && user) {
      // Check repost status
      checkRepostStatus(postId)
        .then(data => setReposted(data.reposted))
        .catch(err => console.error('Error checking repost status:', err));
      
      // Get repost count
      getRepostCount(postId)
        .then(data => setRepostCount(data.count))
        .catch(err => console.error('Error getting repost count:', err));
    }
  }, [postId, user]);

  const handleUsernameClick = () => {
    if (post && post.User && post.User.username) {
      navigate(`/profile/${post.User.username}`);
    }
  };

  // Early return if post is null/undefined to prevent errors
  if (!post) {
    return null;
  }

  const handleRepost = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!user || reposting) return;
    
    setReposting(true);
    try {
      const result = await repostPost(postId);
      setReposted(result.reposted);
      
      // Update repost count
      if (result.reposted) {
        setRepostCount(prev => prev + 1);
        console.log('PostCard: Repost successful, calling onRepostUpdate');
        if (onRepostUpdate) onRepostUpdate(Date.now()); // Trigger profile refresh
      } else {
        setRepostCount(prev => Math.max(0, prev - 1));
        console.log('PostCard: Unrepost successful, calling onRepostUpdate');
        if (onRepostUpdate) onRepostUpdate(Date.now()); // Also refresh on unrepost
      }
    } catch (err) {
      console.error('Error reposting:', err);
    } finally {
      setReposting(false);
    }
  };

  return (
    <>
      <div className="bg-neutral-800 rounded-xl p-4 flex gap-4 text-left w-full max-w-xl mx-auto mb-6 shadow-sm border border-neutral-700 relative group">
        {/* Avatar with follow/unfollow button in the corner */}
        <div className="relative w-10 h-10 mt-1">
          <img src={avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
          {showFollowButton && !isOwn && (
            isFollowing ? (
              <button
                type="button"
                className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-neutral-700 text-white text-xs flex items-center justify-center border-2 border-black shadow hover:bg-neutral-600 transition"
                onClick={onUnfollow}
                title="Unfollow"
                style={{ zIndex: 3 }}
              >
                –
              </button>
            ) : (
              <button
                type="button"
                className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-white text-black text-xs flex items-center justify-center border-2 border-black shadow hover:bg-gray-500 transition"
                onClick={onFollow}
                title="Follow"
                style={{ zIndex: 3 }}
              >
                +
              </button>
            )
          )}
        </div>
        {/* Post Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span 
              className="font-semibold text-white cursor-pointer hover:text-blue-400 transition-colors" 
              onClick={handleUsernameClick}
            >
              {username}
            </span>
            <span className="text-xs text-neutral-400">· {time}</span>
          </div>
          <div className="text-white mb-3">
            {content}
          </div>
          {/* Actions */}
          <div className="flex gap-6 text-neutral-400 text-lg items-center">
            <button
              type="button"
              className={`hover:text-red-400 transition flex items-center ${liked ? 'text-red-500' : ''}`}
              title="Like"
              onClick={onLike}
            >
              ❤️ <span className="ml-1 text-base">{likesCount || 0}</span>
            </button>
            <button type="button" className="hover:text-blue-400 transition flex items-center" title="Reply" onClick={onCommentClick}>
              💬
              <span className="ml-1 text-base">{commentCount}</span>
            </button>
            <button 
              type="button" 
              className={`hover:text-green-400 transition flex items-center ${reposted ? 'text-green-500' : ''} ${reposting ? 'opacity-50' : ''}`} 
              title="Repost" 
              onClick={handleRepost}
              disabled={reposting}
            >
              🔁 <span className="ml-1 text-base">{repostCount}</span>
            </button>
            <button type="button" className="hover:text-blue-400 transition flex items-center" title="Send in Chat" onClick={() => setShowSendPostToUserModal(true)}>
              ↗️
            </button>
          </div>
        </div>
        {/* Dropdown trigger and menu */}
        {showDropdown && (
          <>
            <button
              type="button"
              className="dropdown-trigger absolute top-2 right-2 bg-neutral-800 text-white rounded-full px-2 py-1 text-xl opacity-80 group-hover:opacity-100 transition focus:outline-none"
              style={{ zIndex: 2 }}
              onClick={onDropdownClick}
              title="More options"
            >
              ...
            </button>
            {dropdownOpen && (
              <div className="dropdown-menu absolute top-10 right-2 bg-neutral-900 border border-neutral-700 rounded-lg shadow-lg py-2 px-4 z-30 flex flex-col min-w-[120px]">
                <button
                  type="button"
                  className="text-red-500 hover:bg-red-100 hover:text-red-700 rounded px-2 py-1 text-sm text-left disabled:opacity-50"
                  onClick={onDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
      
      <StartChatModal
        isOpen={showStartChatModal}
        onClose={() => setShowStartChatModal(false)}
        currentUser={user}
        targetUser={post?.User}
      />
      <SendPostToUserModal
        isOpen={showSendPostToUserModal}
        onClose={() => setShowSendPostToUserModal(false)}
        post={post || null}
        onUserSelect={(user) => {
          setSelectedUserForPost(user);
          setShowSendPostToUserModal(false);
          setShowSendPostChatModal(true);
        }}
      />
      <StartChatModal
        isOpen={showSendPostChatModal}
        onClose={() => {
          setShowSendPostChatModal(false);
          setSelectedUserForPost(null);
        }}
        currentUser={user}
        targetUser={selectedUserForPost}
        postToSend={post}
      />
    </>
  )
}

export default PostCard
