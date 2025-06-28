import React, { createContext, useContext, useState } from 'react';

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