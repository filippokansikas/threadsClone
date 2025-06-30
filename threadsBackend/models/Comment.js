const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');
const User = require('./User');
const Post = require('./Post');

const Comment = sequelize.define('Comment', {
  content: { type: DataTypes.STRING, allowNull: false },
}, {
  timestamps: true,
});

Comment.belongsTo(User, { foreignKey: 'userId' });
Comment.belongsTo(Post, { foreignKey: 'postId' });
User.hasMany(Comment, { foreignKey: 'userId' });
Post.hasMany(Comment, { foreignKey: 'postId' });

module.exports = Comment; 