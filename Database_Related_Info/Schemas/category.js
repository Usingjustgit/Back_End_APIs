const mongoose = require("mongoose");

const categorySchema = mongoose.Schema({
  name: { type: String, required: true },
  color: { type: String, required: true },
  icon: { type: String, default: "" },
  image: [{ type: String, required: true }],
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: "products" }],
});

const Category = mongoose.model("category", categorySchema);

module.exports = Category;
