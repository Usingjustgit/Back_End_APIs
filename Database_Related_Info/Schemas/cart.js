const mongoose = require("mongoose");

const cartSchema = mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "products",
    required: true,
  },
  quantity: { type: Number, default: 0, min: 0, required: true },
  dateOfPurchase: { type: Date, default: Date.now },
});
const cart = mongoose.model("cart", cartSchema);

module.exports = cart;
