const mongoose = require('mongoose');

const guestSchema = new mongoose.Schema({
    guest_id: { type: Number, required: true, unique: true },
    user_id: { type: mongoose.Schema.Type.ObjectId, ref: 'User' }, // Reference to the User table
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone_number: { type: String, required: true },
    rsvp_status: { type: String },
    dietary_restrictions: { type: String }
  });