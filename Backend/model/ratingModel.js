const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    kitchenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Kitchen",
      required: true,
      index: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    feedback: { type: String, default: "" },
  },
  { timestamps: true }
);

ratingSchema.index({ userId: 1, kitchenId: 1 }, { unique: true });

const RatingModel = mongoose.model("Rating", ratingSchema);
module.exports = { RatingModel };
