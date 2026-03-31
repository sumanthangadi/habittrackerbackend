const express = require('express');
const router = express.Router();
const {
  getHabits,
  getHabit,
  createHabit,
  updateHabit,
  deleteHabit,
} = require('../controllers/habitController');
const {
  logHabit,
  getTodayHabits,
  getWeeklyStats,
} = require('../controllers/habitLogController');

// Habit log routes (must come before /:id to avoid conflicts)
router.post('/log', logHabit);
router.get('/today', getTodayHabits);
router.get('/week', getWeeklyStats);

// Habit CRUD routes
router.route('/').get(getHabits).post(createHabit);
router.route('/:id').get(getHabit).put(updateHabit).delete(deleteHabit);

module.exports = router;
