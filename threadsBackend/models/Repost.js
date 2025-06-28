const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const Repost = sequelize.define('Repost', {
  // Additional fields can be added here if needed
}, {
  timestamps: true,
});

module.exports = Repost; 