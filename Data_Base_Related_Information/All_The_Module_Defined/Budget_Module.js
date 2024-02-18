const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
    budget_id: { type: Number, required: true, unique: true },
    user_id: { type: mongoose.Schema.Type.ObjectId, ref: 'User' }, // Reference to the User table
    category: { type: String, required: true },
    expense_description: { type: String, required: true },
    amount: { type: Number, required: true },
    payment_status: { type: String, required: true },
    payment_date: { type: Date }
  });