const mongoose = require("mongoose");
const validator = require("validator");

const orderSchema = mongoose.Schema({
  cartItems: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "cart",
  },
  phone: {
    type: String,
    validate: [validator.isMobilePhone, "Phone number must be 10 digits"],
    required: true,
  },
  country: { type: String, required: [true, "Country is required"] },
  state: { type: String, required: [true, "State is required"] },
  district: { type: String, required: [true, "District is required"] },
  city: { type: String, required: [true, "City is required"] },
  shippingAddress1: { type: String, required: [true, "Address is required"] },
  shippingAddress2: { type: String, default: "" },
  status: { type: String, default: "Pending" },
  totalPrice: { type: Number, default: 0, min: 0, required: true },
  dateOfOrdered: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

const order = mongoose.model("order", orderSchema);

module.exports = order;
