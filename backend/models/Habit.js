const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Habit name is required'],
      trim: true,
    },
    time: {
      type: String,
      default: null,
    },
    type: {
      type: String,
      enum: ['daily', 'custom'],
      default: 'daily',
    },
    days: {
      type: [String],
      enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      default: [],
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Habit', habitSchema);
