const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  richdescription: { type: String, default: "" },
  image: { type: String, required: true },
  images: [{ type: String, default: "" }],
  videos: [{ type: String, default: "" }],
  company: { type: String, required: true },
  price: { type: Number, required: true },
  wight: { type: Number, default: 0 },
  color: { type: String, default: "" },
  category: [
    {
      type: String,
      enum: ["All"],
      default: "All",
    },
  ],
  countInStock: { type: Number, required: true },
  rating: { type: Number, required: true },
  isFeatured: { type: Boolean, default: false },
  count_selling: { type: Number, default: 0 },
  count_selling_price: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const products = mongoose.model("products", productSchema);

module.exports = products;
