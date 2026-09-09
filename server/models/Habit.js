const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Habit = sequelize.define('Habit', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  color: {
    type: DataTypes.STRING(20),
    defaultValue: '#6366f1'
  },
  icon: {
    type: DataTypes.STRING(50),
    defaultValue: '📌'
  }
}, {
  tableName: 'habits',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Habit;
