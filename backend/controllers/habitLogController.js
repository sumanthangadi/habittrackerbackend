const HabitLog = require('../models/HabitLog');
const Habit = require('../models/Habit');

// @desc    Log habit completion (toggle)
// @route   POST /api/habits/log
exports.logHabit = async (req, res) => {
  try {
    const { habitId, date, completed } = req.body;

    // Upsert: create or update the log entry
    const log = await HabitLog.findOneAndUpdate(
      { habitId, date },
      { completed: completed !== undefined ? completed : true },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: log });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get today's habits with completion status
// @route   GET /api/habits/today
exports.getTodayHabits = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];

    // Get all active habits applicable today
    const habits = await Habit.find({
      active: true,
      $or: [
        { type: 'daily' },
        { type: 'custom', days: dayName },
      ],
    });

    // Get today's logs
    const logs = await HabitLog.find({
      date: today,
      habitId: { $in: habits.map((h) => h._id) },
    });

    const logMap = {};
    logs.forEach((log) => {
      logMap[log.habitId.toString()] = log.completed;
    });

    const result = habits.map((habit) => ({
      _id: habit._id,
      name: habit.name,
      time: habit.time,
      type: habit.type,
      completed: logMap[habit._id.toString()] || false,
    }));

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get weekly completion stats
// @route   GET /api/habits/week
exports.getWeeklyStats = async (req, res) => {
  try {
    const today = new Date();
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }

    const habits = await Habit.find({ active: true });
    const logs = await HabitLog.find({
      date: { $in: dates },
      completed: true,
    });

    // Build per-day stats
    const weekData = dates.map((date) => {
      const dayLogs = logs.filter((l) => l.date === date);
      const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(date + 'T00:00:00').getDay()];

      // Count habits applicable on this day
      const applicableHabits = habits.filter(
        (h) => h.type === 'daily' || (h.type === 'custom' && h.days.includes(dayName))
      );

      const total = applicableHabits.length;
      const completed = dayLogs.length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        date,
        day: dayName,
        total,
        completed,
        percentage,
      };
    });

    // Per-habit breakdown
    const habitBreakdown = habits.map((habit) => {
      const habitLogs = logs.filter((l) => l.habitId.toString() === habit._id.toString());
      return {
        _id: habit._id,
        name: habit.name,
        completedDays: habitLogs.map((l) => l.date),
        completionRate: dates.length > 0 ? Math.round((habitLogs.length / 7) * 100) : 0,
      };
    });

    res.status(200).json({
      success: true,
      data: { week: weekData, habits: habitBreakdown },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
