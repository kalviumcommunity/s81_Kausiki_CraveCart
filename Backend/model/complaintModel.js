const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    reporterUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    kitchenId: { type: mongoose.Schema.Types.ObjectId, ref: "Kitchen", default: null },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },

    type: {
      type: String,
      enum: ["complaint", "policy_violation", "review_flag"],
      default: "complaint",
      index: true,
    },
    category: { type: String, default: "" },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["open", "investigating", "resolved", "rejected"],
      default: "open",
      index: true,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
      index: true,
    },
    adminNotes: { type: String, default: "" },
    labels: { type: [String], default: [] },
  },
  { timestamps: true }
);

complaintSchema.index({ type: 1, status: 1 });

const ComplaintModel = mongoose.model("Complaint", complaintSchema);
module.exports = { ComplaintModel };
