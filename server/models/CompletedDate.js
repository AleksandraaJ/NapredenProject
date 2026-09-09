const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Habit = require('./Habit');

const CompletedDate = sequelize.define('CompletedDate', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  habit_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Habit,
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  }
}, {
  tableName: 'completed_dates',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['habit_id', 'date']
    }
  ]
});

// Define associations
Habit.hasMany(CompletedDate, { foreignKey: 'habit_id', as: 'completedDates', onDelete: 'CASCADE' });
CompletedDate.belongsTo(Habit, { foreignKey: 'habit_id' });

module.exports = CompletedDate;
