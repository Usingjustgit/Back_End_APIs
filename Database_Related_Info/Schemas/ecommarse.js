const mongoose = require("mongoose");

const ecommarseSchema = mongoose.Schema({
  site_visited_user: [{ type: String, default: "" }],
  total_incomes: { type: Number, default: 0 },
});

const ecommarse = mongoose.model("ecommarse", ecommarseSchema);

module.exports = ecommarse;
