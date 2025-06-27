import React from 'react';

const notifications = [
  {
    type: 'like',
    user: {
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      username: 'john_doe',
    },
    post: 'Just joined Threads! Excited to see what everyone is talking about.',
    time: '2m',
  },
  {
    type: 'repost',
    user: {
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      username: 'jane_smith',
    },
    post: 'Loving the new dark mode. Anyone else? 🌙',
    time: '10m',
  },
  {
    type: 'like',
    user: {
      avatar: 'https://randomuser.me/api/portraits/men/65.jpg',
      username: 'mike_ross',
    },
    post: 'Working on a new project. Stay tuned for updates! 🚀',
    time: '30m',
  },
  {
    type: 'repost',
    user: {
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
      username: 'sara_connor',
    },
    post: 'Had a great coffee this morning ☕️. How\'s everyone doing?',
    time: '1h',
  },
];

function Notifications() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center pt-0 px-0">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 w-full bg-black/80 backdrop-blur border-b border-neutral-800 flex items-center justify-center py-6 mb-6 shadow-sm">
        <span className="text-2xl mr-3">🔔</span>
        <h1 className="text-2xl font-bold text-white tracking-tight">Notifications</h1>
      </div>
      <div className="w-full max-w-xl px-2 sm:px-0">
        {notifications.length === 0 ? (
          <div className="text-neutral-500 text-center mt-16">No notifications yet.</div>
        ) : (
          notifications.map((notif, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 bg-neutral-900 border border-neutral-800 rounded-2xl p-5 mb-4 shadow-sm hover:shadow-lg hover:border-neutral-600 transition-all cursor-pointer group"
            >
              <img src={notif.user.avatar} alt="avatar" className="w-12 h-12 rounded-full object-cover mt-1 border-2 border-neutral-800 group-hover:border-white transition" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-white text-base">{notif.user.username}</span>
                  <span className="text-xs text-neutral-400">· {notif.time}</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-300 mb-1 text-left">
                  {notif.type === 'like' ? (
                    <span className="text-pink-400 text-lg">❤️</span>
                  ) : (
                    <span className="text-blue-400 text-lg">🔁</span>
                  )}
                  <span className="text-sm">
                    {notif.type === 'like' ? 'liked your post' : 'reposted your post'}
                  </span>
                </div>
                <div className="text-neutral-400 text-sm italic truncate text-left">"{notif.post}"</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Notifications; 