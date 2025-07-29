const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const Repost = sequelize.define('Repost', {
  reposterId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  originalPostId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Posts',
      key: 'id'
    }
  }
}, {
  timestamps: true,
});

module.exports = Repost; 