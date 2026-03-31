const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    date: {
      type: String,
      required: [true, 'Date is required (YYYY-MM-DD)'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
    },
    time: {
      type: String,
      default: null,
    },
    type: {
      type: String,
      default: 'manual',
    },
    status: {
      type: String,
      enum: ['pending', 'done'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
