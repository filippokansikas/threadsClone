const User = require('./User');
const Post = require('./Post');
const Repost = require('./Repost');
const Notification = require('./Notification');

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

module.exports = {
  User,
  Post,
  Repost,
  Notification
}; 