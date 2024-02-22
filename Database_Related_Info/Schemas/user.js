const mongoose = require("mongoose");
const validator = require("validator");

// User Schema for stored data in this form
const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, "Name is required"] },
  email: {
    type: String,
    required: [true, "Email is required"],
    validate: [validator.isEmail, "Email is invalid"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    unique: true,
  },
  birth_date: { type: Date, require: [true, "Birth date is required"] },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
    require: [true, "Gender is required"],
  },
  country: { type: String, required: [true, "Country is required"] },
  State: { type: String, default: "" },
  district: { type: String, default: "" },
  city: { type: String, default: "" },
  address: { type: String, required: [true, "Address is required"] },
  zip: { type: String, default: "" },
  phone: {
    type: String,
    validate: [validator.isMobilePhone, "Phone number must be 10 digits"],
    required: [true, "Phone is required"],
  },
  role: {
    type: String,
    enum: ["user", "admin", "product_owner", "super_admin"],
    default: "user",
  },
  cart: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "cart",
      default: [],
    },
  ],
  order: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "order_items",
    },
  ],
  total_order: { type: Number, default: 0 },
  total_invest: { type: Number, default: 0 },
  profile_picture: { type: String, default: "" },
});

const User = mongoose.model("user", userSchema);

module.exports = User;
