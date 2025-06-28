import React, { useState, useEffect } from 'react';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from './api';
import { useNotification } from './NotificationContext';

function Notifications({ onMessageNotificationClick }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { clearNotificationIndicator } = useNotification();

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Clear notification indicator when component mounts
  useEffect(() => {
    clearNotificationIndicator();
  }, [clearNotificationIndicator]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data);
    } catch (err) {
      setError('Failed to load notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      try {
        await markNotificationAsRead(notification.id);
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
        );
        // Clear notification indicator if all notifications are now read
        if (notifications.every(n => n.id === notification.id ? true : n.read)) {
          clearNotificationIndicator();
        }
      } catch (err) {
        console.error('Error marking notification as read:', err);
      }
    }

    // Handle message notifications by opening chat
    if (notification.type === 'message' && onMessageNotificationClick) {
      onMessageNotificationClick(notification.sender);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      // Clear notification indicator
      clearNotificationIndicator();
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like': return '❤️';
      case 'follow': return '👤';
      case 'repost': return '🔁';
      case 'message': return '💬';
      default: return '📢';
    }
  };

  const getNotificationText = (type) => {
    switch (type) {
      case 'like': return 'liked your post';
      case 'follow': return 'started following you';
      case 'repost': return 'reposted your post';
      case 'message': return 'sent you a message';
      default: return 'interacted with your content';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center pt-0 px-0">
        <div className="sticky top-0 z-10 w-full bg-black/80 backdrop-blur border-b border-neutral-800 flex items-center justify-center py-6 mb-6 shadow-sm">
          <span className="text-2xl mr-3">🔔</span>
          <h1 className="text-2xl font-bold text-white tracking-tight">Notifications</h1>
        </div>
        <div className="w-full max-w-xl px-2 sm:px-0">
          <div className="text-neutral-500 text-center mt-16">Loading notifications...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center pt-0 px-0">
        <div className="sticky top-0 z-10 w-full bg-black/80 backdrop-blur border-b border-neutral-800 flex items-center justify-center py-6 mb-6 shadow-sm">
          <span className="text-2xl mr-3">🔔</span>
          <h1 className="text-2xl font-bold text-white tracking-tight">Notifications</h1>
        </div>
        <div className="w-full max-w-xl px-2 sm:px-0">
          <div className="text-red-500 text-center mt-16">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center pt-0 px-0">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 w-full bg-black/80 backdrop-blur border-b border-neutral-800 flex items-center justify-center py-6 mb-6 shadow-sm">
        <span className="text-2xl mr-3">🔔</span>
        <h1 className="text-2xl font-bold text-white tracking-tight">Notifications</h1>
        {notifications.some(n => !n.read) && (
          <button
            onClick={handleMarkAllRead}
            className="ml-auto mr-4 text-blue-400 text-sm hover:text-blue-300 transition"
          >
            Mark all read
          </button>
        )}
      </div>
      <div className="w-full max-w-xl px-2 sm:px-0">
        {notifications.length === 0 ? (
          <div className="text-neutral-500 text-center mt-16">No notifications yet.</div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`flex items-start gap-4 bg-neutral-900 border border-neutral-800 rounded-2xl p-5 mb-4 shadow-sm hover:shadow-lg hover:border-neutral-600 transition-all cursor-pointer group ${
                !notif.read ? 'border-blue-500/50 bg-blue-500/5' : ''
              }`}
            >
              <img 
                src={notif.sender?.profilePicture || 'https://randomuser.me/api/portraits/men/32.jpg'} 
                alt="avatar" 
                className="w-12 h-12 rounded-full object-cover mt-1 border-2 border-neutral-800 group-hover:border-white transition" 
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-white text-base">{notif.sender?.username}</span>
                  <span className="text-xs text-neutral-400">· {formatTimeAgo(notif.createdAt)}</span>
                  {!notif.read && <span className="w-2 h-2 bg-blue-500 rounded-full"></span>}
                </div>
                <div className="flex items-center gap-2 text-neutral-300 mb-1 text-left">
                  <span className="text-lg">{getNotificationIcon(notif.type)}</span>
                  <span className="text-sm">{getNotificationText(notif.type)}</span>
                </div>
                {notif.post && (
                  <div className="text-neutral-400 text-sm italic truncate text-left">
                    "{notif.post.content}"
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Notifications; 