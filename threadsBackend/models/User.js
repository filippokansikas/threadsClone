const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const User = sequelize.define('User', {
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  bio: { type: DataTypes.STRING, defaultValue: '' },
  profilePicture: { type: DataTypes.STRING, defaultValue: '' },
}, {
  timestamps: true,
});

// Follows join table for many-to-many self-association
const Follows = sequelize.define('Follows', {}, { timestamps: false });
User.belongsToMany(User, { as: 'Followers', through: Follows, foreignKey: 'followingId' });
User.belongsToMany(User, { as: 'Following', through: Follows, foreignKey: 'followerId' });

module.exports = User; 