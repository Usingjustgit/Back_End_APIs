const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
    venue_id: { type: Number, required: true, unique: true },
    user_id: { type: mongoose.Schema.Type.ObjectId, ref: 'User' }, // Reference to the User table
    name: { type: String, required: true },
    address: { type: String, required: true },
    availability: { type: String, required: true },
    capacity: { type: Number, required: true },
    price: { type: Number, required: true }
  });