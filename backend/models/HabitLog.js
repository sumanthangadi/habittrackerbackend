const mongoose = require('mongoose');

const habitLogSchema = new mongoose.Schema(
  {
    habitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Habit',
      required: true,
    },
    date: {
      type: String,
      required: [true, 'Date is required (YYYY-MM-DD)'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
    },
    completed: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

habitLogSchema.index({ habitId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('HabitLog', habitLogSchema);
