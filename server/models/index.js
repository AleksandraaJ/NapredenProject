const sequelize = require('../config/database');
const Habit = require('./Habit');
const CompletedDate = require('./CompletedDate');

module.exports = {
  sequelize,
  Habit,
  CompletedDate
};
