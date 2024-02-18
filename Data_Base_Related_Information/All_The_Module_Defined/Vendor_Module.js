const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
    vendor_id: { type: Number, required: true, unique: true },
    user_id: { type: mongoose.Schema.Type.ObjectId, ref: 'User' }, // Reference to the User table
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone_number: { type: String, required: true },
    service_type: { type: String, required: true },
    website: { type: String }
  });