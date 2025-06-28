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

module.exports = User; 