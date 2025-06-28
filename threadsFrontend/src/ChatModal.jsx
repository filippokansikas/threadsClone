import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useNotification } from './NotificationContext';

function ChatModal({ isOpen, onClose, currentUser }) {
  const [socket, setSocket] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [following, setFollowing] = useState([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const messagesEndRef = useRef(null);
  const { setNotificationIndicator } = useNotification();

  useEffect(() => {
    if (isOpen && currentUser) {
      const newSocket = io('http://localhost:5001');
      setSocket(newSocket);

      // Fetch conversations and following list
      fetchConversations();
      fetchFollowing();

      return () => {
        newSocket.close();
      };
    }
  }, [isOpen, currentUser]);

  useEffect(() => {
    if (socket) {
      socket.on('receive_message', (message) => {
        if (selectedConversation && message.conversationId === selectedConversation.id) {
          setMessages(prev => [...prev, message]);
        }
      });

      return () => {
        socket.off('receive_message');
      };
    }
  }, [socket, selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/conversations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  const fetchFollowing = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/following', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setFollowing(data);
    } catch (error) {
      console.error('Failed to fetch following:', error);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/conversations/${conversationId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const selectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setShowNewChat(false);
    fetchMessages(conversation.id);
    markConversationAsRead(conversation.id);
    if (socket) {
      socket.emit('join_conversation', conversation.id);
    }
  };

  const markConversationAsRead = async (conversationId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/users/conversations/${conversationId}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Check if there are any remaining unread notifications
      const notificationsResponse = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const notifications = await notificationsResponse.json();
      const hasUnread = notifications.some(notification => !notification.read);
      setNotificationIndicator(hasUnread);
    } catch (error) {
      console.error('Failed to mark conversation as read:', error);
    }
  };

  const startNewChat = async (targetUser) => {
    try {
      if (socket) {
        socket.emit('start_conversation', {
          user1Id: currentUser.id,
          user2Id: targetUser.id
        }, (conversationData) => {
          setSelectedConversation(conversationData);
          setShowNewChat(false);
          socket.emit('join_conversation', conversationData.id);
          fetchConversations(); // Refresh conversations list
        });
      }
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedConversation || !socket) return;

    socket.emit('send_message', {
      conversationId: selectedConversation.id,
      senderId: currentUser.id,
      content: newMessage.trim()
    });

    setNewMessage('');
  };

  const getOtherUser = (conversation) => {
    return conversation.user1Id === currentUser.id ? conversation.user2 : conversation.user1;
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-neutral-900 w-full h-full flex">
        {/* Conversations List */}
        <div className="w-1/3 border-r border-neutral-800 flex flex-col">
          <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Messages</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setShowNewChat(!showNewChat);
                  setSelectedConversation(null);
                }}
                className="text-blue-400 hover:text-blue-300 transition-colors"
                title="New Chat"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <button
                onClick={onClose}
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {showNewChat ? (
              <div>
                <div className="p-4 border-b border-neutral-800">
                  <h3 className="text-white font-semibold">Start New Chat</h3>
                  <p className="text-neutral-400 text-sm">Select someone you follow</p>
                </div>
                {following.map((user) => (
                  <div
                    key={user.id}
                    className="p-4 cursor-pointer hover:bg-neutral-800 transition-colors border-b border-neutral-700"
                    onClick={() => startNewChat(user)}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={user.profilePicture || 'https://i.pravatar.cc/100'}
                        alt="avatar"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="text-white font-semibold">@{user.username}</h3>
                        <p className="text-neutral-400 text-sm">Click to start chat</p>
                      </div>
                    </div>
                  </div>
                ))}
                {following.length === 0 && (
                  <div className="p-4 text-center">
                    <p className="text-neutral-400">You're not following anyone yet</p>
                  </div>
                )}
              </div>
            ) : (
              conversations.map((conversation) => {
                const otherUser = getOtherUser(conversation);
                return (
                  <div
                    key={conversation.id}
                    className={`p-4 cursor-pointer hover:bg-neutral-800 transition-colors ${
                      selectedConversation?.id === conversation.id ? 'bg-neutral-800' : ''
                    }`}
                    onClick={() => selectConversation(conversation)}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={otherUser.profilePicture || 'https://i.pravatar.cc/100'}
                        alt="avatar"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="text-white font-semibold">@{otherUser.username}</h3>
                        <p className="text-neutral-400 text-sm">
                          {conversation.updatedAt ? new Date(conversation.updatedAt).toLocaleDateString() : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-neutral-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={getOtherUser(selectedConversation).profilePicture || 'https://i.pravatar.cc/100'}
                      alt="avatar"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <h3 className="text-white font-semibold">
                      @{getOtherUser(selectedConversation).username}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="text-neutral-400 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.senderId === currentUser.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-neutral-800 text-white'
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-neutral-800">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 p-2 rounded-lg bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-neutral-400">Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatModal; 