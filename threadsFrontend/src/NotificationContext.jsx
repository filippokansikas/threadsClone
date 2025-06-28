import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Get user info to check if we should connect to socket
    const user = localStorage.getItem('user');
    if (user) {
      const newSocket = io('http://localhost:5001');
      setSocket(newSocket);

      // Listen for new notifications
      newSocket.on('new_notification', (notification) => {
        const currentUser = JSON.parse(localStorage.getItem('user'));
        if (notification.recipientId === currentUser.id) {
          setHasUnreadNotifications(true);
          
          // Show browser notification if permission is granted
          if (Notification.permission === 'granted') {
            new Notification('New Message', {
              body: notification.content,
              icon: '/favicon.ico'
            });
          }
        }
      });

      return () => {
        newSocket.close();
      };
    }
  }, []);

  const clearNotificationIndicator = () => {
    setHasUnreadNotifications(false);
  };

  const setNotificationIndicator = (hasUnread) => {
    setHasUnreadNotifications(hasUnread);
  };

  return (
    <NotificationContext.Provider value={{
      hasUnreadNotifications,
      clearNotificationIndicator,
      setNotificationIndicator
    }}>
      {children}
    </NotificationContext.Provider>
  );
}; 