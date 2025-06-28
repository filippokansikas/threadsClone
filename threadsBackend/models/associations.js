const User = require('./User');
const Post = require('./Post');
const Repost = require('./Repost');
const Notification = require('./Notification');
const Conversation = require('./Conversation');
const Message = require('./Message');

// User associations (already defined in User.js)
// User.hasMany(Post, { foreignKey: 'userId' });
// Post.belongsTo(User, { foreignKey: 'userId' });

// Follow associations (already defined in User.js)
// User.belongsToMany(User, { 
//   as: 'Following', 
//   foreignKey: 'followerId', 
//   through: 'Follows' 
// });
// User.belongsToMany(User, { 
//   as: 'Followers', 
//   foreignKey: 'followingId', 
//   through: 'Follows' 
// });

// Repost associations
Repost.belongsTo(User, { as: 'reposter', foreignKey: 'reposterId' });
Repost.belongsTo(Post, { as: 'originalPost', foreignKey: 'originalPostId' });
Post.hasMany(Repost, { as: 'Reposts', foreignKey: 'originalPostId' });

// Notification associations (already defined in Notification.js)
// Notification.belongsTo(User, { as: 'recipient', foreignKey: 'recipientId' });
// Notification.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });
// Notification.belongsTo(Post, { as: 'post', foreignKey: 'postId' });

Conversation.hasMany(Message, { foreignKey: 'conversationId', onDelete: 'CASCADE' });
Message.belongsTo(Conversation, { foreignKey: 'conversationId' });

User.hasMany(Message, { foreignKey: 'senderId', onDelete: 'CASCADE' });
Message.belongsTo(User, { foreignKey: 'senderId' });

Conversation.belongsTo(User, { as: 'user1', foreignKey: 'user1Id' });
Conversation.belongsTo(User, { as: 'user2', foreignKey: 'user2Id' });

module.exports = {
  User,
  Post,
  Repost,
  Notification,
  Conversation,
  Message
}; 