export const API_BASE_URL = 'http://localhost:5001/api'; 

// Notifications API
export const getNotifications = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('/api/notifications', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) throw new Error('Failed to fetch notifications');
  return response.json();
};

export const markNotificationAsRead = async (notificationId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`/api/notifications/${notificationId}/read`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) throw new Error('Failed to mark notification as read');
  return response.json();
};

export const markAllNotificationsAsRead = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('/api/notifications/read-all', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) throw new Error('Failed to mark all notifications as read');
  return response.json();
};

// Repost API
export const repostPost = async (postId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`/api/posts/${postId}/repost`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) throw new Error('Failed to repost');
  return response.json();
};

export const checkRepostStatus = async (postId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`/api/posts/${postId}/repost/check`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) throw new Error('Failed to check repost status');
  return response.json();
};

export const getRepostCount = async (postId) => {
  const response = await fetch(`/api/posts/${postId}/repost/count`);
  if (!response.ok) throw new Error('Failed to get repost count');
  return response.json();
}; 