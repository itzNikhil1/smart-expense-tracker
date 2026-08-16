const mongoose = require('mongoose');

const EXPENSE_CATEGORIES = ['Food', 'Travel', 'Bills', 'Shopping', 'Health', 'Other'];

const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Expense must belong to a user'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please provide an expense amount'],
      min: [0.01, 'Amount must be a positive number greater than 0'],
    },
    category: {
      type: String,
      required: [true, 'Please specify an expense category'],
      enum: {
        values: EXPENSE_CATEGORIES,
        message: '{VALUE} is not a supported category. Must be one of: ' + EXPENSE_CATEGORIES.join(', '),
      },
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    date: {
      type: Date,
      required: [true, 'Please provide a date'],
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

expenseSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Expense', expenseSchema);
module.exports.EXPENSE_CATEGORIES = EXPENSE_CATEGORIES;
