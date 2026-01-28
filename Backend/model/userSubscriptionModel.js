const mongoose = require("mongoose");

const userSubscriptionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true, index: true },
    status: { type: String, enum: ["active", "cancelled", "expired"], default: "active", index: true },
  },
  { timestamps: true }
);

const UserSubscriptionModel = mongoose.model("UserSubscription", userSubscriptionSchema);
module.exports = { UserSubscriptionModel };
