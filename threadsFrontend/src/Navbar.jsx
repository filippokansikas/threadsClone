import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getNotifications } from './api'
import { useNotification } from './NotificationContext'
import ChatModal from './ChatModal'

function Navbar() {
  const location = useLocation();
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';
  const { hasUnreadNotifications, setNotificationIndicator } = useNotification();
  const [user, setUser] = useState(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  useEffect(() => {
    // Get user info from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Add a function to check unread messages and expose it for ChatModal
  const checkUnreadMessages = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch('/api/users/conversations/unread/count', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setHasUnreadMessages(data.unreadCount > 0);
    } catch (error) {
      console.error('Error checking unread messages:', error);
    }
  };

  useEffect(() => {
    const checkUnreadNotifications = async () => {
      if (!user) return;
      
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const notifications = await getNotifications();
        const hasUnread = notifications.some(notification => !notification.read);
        setNotificationIndicator(hasUnread);
      } catch (error) {
        console.error('Error checking notifications:', error);
      }
    };

    checkUnreadNotifications();
    checkUnreadMessages();
    
    // Check for new notifications and messages every 30 seconds
    const interval = setInterval(() => {
      checkUnreadNotifications();
      checkUnreadMessages();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [user, setNotificationIndicator]);

  return (
    <>
      <nav className="fixed top-0 left-0 h-full w-20 bg-neutral-900 border-r border-neutral-800 flex flex-col items-center py-6 z-50">
        {/* Top: Logo */}
        <div className="flex flex-col items-center gap-4">
          <span className="font-bold text-2xl tracking-tight text-white">T</span>
        </div>
        {/* Middle: Navigation Icons, Post Thread Button, and Profile */}
        <div className="flex flex-col items-center gap-6 flex-1 justify-center">
          <Link to="/" className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-neutral-700">
            <span role="img" aria-label="Home" className="text-white">🏠</span>
          </Link>
          <Link to="/search" className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-neutral-700">
            <span role="img" aria-label="Search" className="text-white">🔍</span>
          </Link>
          {/* Post Thread Button as Link */}
          <Link to="/post" className="w-10 h-10 rounded-full bg-white border border-gray-400 flex items-center justify-center transition-colors duration-200 group hover:bg-black hover:border-gray-400" title="Post new thread">
            <span role="img" aria-label="New Thread" className="text-lg text-neutral-800 group-hover:text-gray-200 transition-colors duration-200">✚</span>
          </Link>
          <Link to="/notifications" className="relative w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-neutral-700">
            <span role="img" aria-label="Notifications" className="text-white">🔔</span>
            {hasUnreadNotifications && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-neutral-900 animate-pulse"></div>
            )}
          </Link>
          {/* Profile Icon below Notification */}
          <Link to="/profile" className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-neutral-700">
            <span role="img" aria-label="Profile" className="text-white">👤</span>
          </Link>
          {/* Chat Button */}
          <button
            onClick={() => {
              setShowChatModal(true);
              setHasUnreadMessages(false); // Clear unread chat indicator immediately
            }}
            className="relative w-12 h-12 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-white mb-4 transition-colors"
            title="Messages"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {hasUnreadMessages && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-neutral-900 animate-pulse"></div>
            )}
          </button>
        </div>
        {/* Bottom: Login Icon */}
        {!isAuthRoute && (
          <div className="flex flex-col items-center gap-4 mt-8">
            <Link to="/login" className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-neutral-700">
              <span role="img" aria-label="Login" className="text-white">🔑</span>
            </Link>
          </div>
        )}
      </nav>
      
      {/* ... existing modals ... */}
      <ChatModal 
        isOpen={showChatModal} 
        onClose={() => {
          setShowChatModal(false);
          checkUnreadMessages(); // Re-check unread messages when chat closes
        }} 
        currentUser={user} 
      />
    </>
  )
}

export default Navbar 