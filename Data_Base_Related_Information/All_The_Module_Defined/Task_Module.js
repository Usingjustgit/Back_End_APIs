const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    task_id: { type: Number, required: true, unique: true },
    user_id: { type: mongoose.Schema.Type.ObjectId, ref: 'User' }, // Reference to the User table
    task_description: { type: String, required: true },
    due_date: { type: Date, required: true },
    task_status: { type: String, required: true }
  });