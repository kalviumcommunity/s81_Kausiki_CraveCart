const mongoose = require("mongoose");

const mealSchema = new mongoose.Schema(
  {
    kitchenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Kitchen",
      required: true,
      index: true,
    },
    date: {
      // store as a Date (UTC midnight recommended by client)
      type: Date,
      required: true,
      index: true,
    },
    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "snacks", "dinner"],
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    imageUrl: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },

    totalQty: { type: Number, required: true, min: 0 },
    soldQty: { type: Number, default: 0, min: 0 },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

mealSchema.index({ kitchenId: 1, date: 1, mealType: 1 }, { unique: true });

mealSchema.virtual("remainingQty").get(function () {
  return Math.max(0, (this.totalQty || 0) - (this.soldQty || 0));
});

mealSchema.set("toJSON", { virtuals: true });
mealSchema.set("toObject", { virtuals: true });

const MealModel = mongoose.model("Meal", mealSchema);
module.exports = { MealModel };
