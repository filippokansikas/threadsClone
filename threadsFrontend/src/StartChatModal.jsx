import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

function StartChatModal({ isOpen, onClose, currentUser, targetUser }) {
  const [socket, setSocket] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && currentUser && targetUser) {
      const newSocket = io('http://localhost:5001');
      setSocket(newSocket);

      // Start or get conversation
      newSocket.emit('start_conversation', {
        user1Id: currentUser.id,
        user2Id: targetUser.id
      }, (conversationData) => {
        setConversation(conversationData);
        // Join the conversation room
        newSocket.emit('join_conversation', conversationData.id);
        // Fetch existing messages
        fetchMessages(conversationData.id);
        // Mark as read
        markConversationAsRead(conversationData.id);
      });

      return () => {
        newSocket.close();
      };
    }
  }, [isOpen, currentUser, targetUser]);

  useEffect(() => {
    if (socket) {
      socket.on('receive_message', (message) => {
        if (conversation && message.conversationId === conversation.id) {
          setMessages(prev => [...prev, message]);
        }
      });

      return () => {
        socket.off('receive_message');
      };
    }
  }, [socket, conversation]);

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

  const markConversationAsRead = async (conversationId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/users/conversations/${conversationId}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Failed to mark conversation as read:', error);
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !conversation || !socket) return;

    socket.emit('send_message', {
      conversationId: conversation.id,
      senderId: currentUser.id,
      content: newMessage.trim()
    });

    setNewMessage('');
  };

  if (!isOpen || !targetUser) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-neutral-900 rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={targetUser.profilePicture || 'https://i.pravatar.cc/100'}
                alt="avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h3 className="text-white font-semibold">@{targetUser.username}</h3>
                <p className="text-neutral-400 text-sm">Start a conversation</p>
              </div>
            </div>
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
      </div>
    </div>
  );
}

export default StartChatModal; 