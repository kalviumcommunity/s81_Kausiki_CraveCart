const mongoose = require("mongoose");

const subscriptionPlanSchema = new mongoose.Schema(
  {
    planType: { type: String, enum: ["weekly", "monthly"], required: true, index: true },
    mealsPerDay: { type: Number, required: true, min: 1, max: 3 },
    price: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

subscriptionPlanSchema.index({ planType: 1, mealsPerDay: 1 }, { unique: true });

const SubscriptionPlanModel = mongoose.model("SubscriptionPlan", subscriptionPlanSchema);
module.exports = { SubscriptionPlanModel };
