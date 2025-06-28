const User = require('./User');
const Post = require('./Post');
const Repost = require('./Repost');
const Notification = require('./Notification');
const Conversation = require('./Conversation');
const Message = require('./Message');
const sequelize = require('./sequelize');

// Follows join table for many-to-many self-association
const Follows = sequelize.define('Follows', {}, { timestamps: false });

// User associations
User.hasMany(Post, { foreignKey: 'userId' });
Post.belongsTo(User, { foreignKey: 'userId' });

// Follow associations
User.belongsToMany(User, { 
  as: 'Following', 
  foreignKey: 'followerId', 
  through: Follows
});
User.belongsToMany(User, { 
  as: 'Followers', 
  foreignKey: 'followingId', 
  through: Follows
});

// Repost associations
Repost.belongsTo(User, { as: 'reposter', foreignKey: 'reposterId' });
Repost.belongsTo(Post, { as: 'originalPost', foreignKey: 'originalPostId' });
Post.hasMany(Repost, { as: 'Reposts', foreignKey: 'originalPostId' });

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