const mongoose = require('mongoose');
  
const registrySchema = new mongoose.Schema({
    registry_id: { type: Number, required: true, unique: true },
    user_id: { type: mongoose.Schema.Type.ObjectId, ref: 'User' }, // Reference to the User table
    item_name: { type: String, required: true },
    quantity: { type: Number, required: true },
    store_name: { type: String, required: true },
    store_link: { type: String, required: true }
});