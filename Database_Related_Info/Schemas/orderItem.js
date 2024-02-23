const mongoose = require("mongoose");

const order_itemsSchema = mongoose.Schema({
  user_product: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
      required: true,
    },
  ],
  quantity: { type: Number, default: 0, min: 0, required: true },
  dateOfPurchase: { type: Date, default: Date.now },
});
const order_items = mongoose.model("order_items", order_itemsSchema);

module.exports = order_items;
