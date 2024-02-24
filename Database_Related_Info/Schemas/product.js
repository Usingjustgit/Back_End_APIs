const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  product_name: { type: String, required: true },
  description: { type: String, required: true },
  richdescription: { type: String, default: "" },
  image: { type: String, required: true },
  images: [{ type: String, default: "" }],
  videos: [{ type: String, default: "" }],
  company: { type: String, required: true },
  price: { type: Number, required: true },
  weight: { type: Number, default: 0 },
  color: { type: String, default: "" },
  category: [
    {
      type: String,
      // enum: ["Electronics", "Fruits", "Vegetables", "Grocery", "Others"],
      required: true,
    },
  ],
  subcategory_name: { type: String, default: "" },
  countInStock: { type: Number, min: 0, required: true },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  isFeatured: { type: Boolean, default: false },
  count_selling: { type: Number, default: 0 },
  count_selling_price: { type: Number, default: 0 },
  review: { type: mongoose.Schema.Types.ObjectId, ref: "review" },
  createdAt: { type: Date, default: Date.now },
});

const products = mongoose.model("products", productSchema);

module.exports = products;
