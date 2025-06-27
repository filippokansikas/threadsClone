import React from 'react'

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
  isOwn = false
}) {
  return (
    <div className="bg-neutral-800 rounded-xl p-4 flex gap-4 text-left w-full max-w-xl mx-auto mb-6 shadow-sm border border-neutral-700 relative group">
      {/* Avatar with follow/unfollow button in the corner */}
      <div className="relative w-10 h-10 mt-1">
        <img src={avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
        {showFollowButton && !isOwn && (
          isFollowing ? (
            <button
              className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-neutral-700 text-white text-xs flex items-center justify-center border-2 border-black shadow hover:bg-neutral-600 transition"
              onClick={onUnfollow}
              title="Unfollow"
              style={{ zIndex: 3 }}
            >
              –
            </button>
          ) : (
            <button
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
          <span className="font-semibold text-white">{username}</span>
          <span className="text-xs text-neutral-400">· {time}</span>
        </div>
        <div className="text-white mb-3">
          {content}
        </div>
        {/* Actions */}
        <div className="flex gap-6 text-neutral-400 text-lg">
          <button className="hover:text-blue-400 transition" title="Like">❤️</button>
          <button className="hover:text-blue-400 transition" title="Reply" onClick={onCommentClick}>💬</button>
          <button className="hover:text-blue-400 transition" title="Repost">🔁</button>
          <button className="hover:text-blue-400 transition" title="Share">↗️</button>
        </div>
      </div>
      {/* Dropdown trigger and menu */}
      {showDropdown && (
        <>
          <button
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
  )
}

export default PostCard
