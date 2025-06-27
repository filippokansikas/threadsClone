const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');
const User = require('./User');

const Post = sequelize.define('Post', {
  content: { type: DataTypes.STRING, allowNull: false },
  likes: { type: DataTypes.JSON, defaultValue: [] }, // Array of user IDs
}, {
  timestamps: true,
});

Post.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Post, { foreignKey: 'userId' });

module.exports = Post; 