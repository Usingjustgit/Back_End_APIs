const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  comment: { type: String, required: true },
  reviewDate: { type: Date, default: Date.now },
});

const review = mongoose.model("review", reviewSchema);

module.exports = review;
