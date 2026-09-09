const express = require('express');
const router = express.Router();
const { Habit, CompletedDate } = require('../models');

// GET /api/habits - Get all habits with completed dates
router.get('/', async (req, res) => {
  try {
    const habits = await Habit.findAll({
      include: [{
        model: CompletedDate,
        as: 'completedDates',
        attributes: ['date']
      }],
      order: [['created_at', 'DESC']]
    });

    // Transform to match frontend expectations
    const transformed = habits.map(habit => ({
      _id: habit.id.toString(),
      name: habit.name,
      color: habit.color,
      icon: habit.icon,
      completedDates: habit.completedDates.map(cd => cd.date),
      createdAt: habit.created_at,
      updatedAt: habit.updated_at
    }));

    res.json(transformed);
  } catch (error) {
    console.error('Error fetching habits:', error);
    res.status(500).json({ message: 'Грешка при вчитување на навиките / Error loading habits' });
  }
});

// POST /api/habits - Create a new habit
router.post('/', async (req, res) => {
  try {
    const { name, color, icon } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Името на навиката е задолжително / Habit name is required' });
    }

    const habit = await Habit.create({
      name: name.trim(),
      color: color || '#6366f1',
      icon: icon || '📌'
    });

    res.status(201).json({
      _id: habit.id.toString(),
      name: habit.name,
      color: habit.color,
      icon: habit.icon,
      completedDates: [],
      createdAt: habit.created_at,
      updatedAt: habit.updated_at
    });
  } catch (error) {
    console.error('Error creating habit:', error);
    res.status(500).json({ message: 'Грешка при креирање на навиката / Error creating habit' });
  }
});

// DELETE /api/habits/:id - Delete a habit
router.delete('/:id', async (req, res) => {
  try {
    const habit = await Habit.findByPk(req.params.id);
    
    if (!habit) {
      return res.status(404).json({ message: 'Навиката не е пронајдена / Habit not found' });
    }

    await habit.destroy();
    res.json({ message: 'Навиката е избришана / Habit deleted', id: req.params.id });
  } catch (error) {
    console.error('Error deleting habit:', error);
    res.status(500).json({ message: 'Грешка при бришење на навиката / Error deleting habit' });
  }
});

// PATCH /api/habits/:id/toggle - Toggle date completion
router.patch('/:id/toggle', async (req, res) => {
  try {
    const { date } = req.body;
    
    if (!date) {
      return res.status(400).json({ message: 'Датумот е задолжителен / Date is required' });
    }

    const habit = await Habit.findByPk(req.params.id);
    
    if (!habit) {
      return res.status(404).json({ message: 'Навиката не е пронајдена / Habit not found' });
    }

    // Check if date already completed
    const existing = await CompletedDate.findOne({
      where: { habit_id: habit.id, date }
    });

    if (existing) {
      await existing.destroy();
    } else {
      await CompletedDate.create({ habit_id: habit.id, date });
    }

    // Fetch updated habit with completed dates
    const updatedHabit = await Habit.findByPk(habit.id, {
      include: [{
        model: CompletedDate,
        as: 'completedDates',
        attributes: ['date']
      }]
    });

    res.json({
      _id: updatedHabit.id.toString(),
      name: updatedHabit.name,
      color: updatedHabit.color,
      icon: updatedHabit.icon,
      completedDates: updatedHabit.completedDates.map(cd => cd.date),
      createdAt: updatedHabit.created_at,
      updatedAt: updatedHabit.updated_at
    });
  } catch (error) {
    console.error('Error toggling date:', error);
    res.status(500).json({ message: 'Грешка при означување / Error toggling date' });
  }
});

module.exports = router;
