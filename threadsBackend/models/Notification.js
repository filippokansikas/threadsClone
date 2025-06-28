const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');
const User = require('./User');
const Post = require('./Post');

const Notification = sequelize.define('Notification', {
  type: { type: DataTypes.STRING, allowNull: false }, // 'like', 'follow', 'repost', etc.
  read: { type: DataTypes.BOOLEAN, defaultValue: false },
  content: { type: DataTypes.STRING }, // Additional context
}, {
  timestamps: true,
});

// Associations
Notification.belongsTo(User, { as: 'recipient', foreignKey: 'recipientId' });
Notification.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });
Notification.belongsTo(Post, { as: 'post', foreignKey: 'postId' });

module.exports = Notification; 