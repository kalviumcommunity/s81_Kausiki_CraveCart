const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    audience: {
      type: String,
      enum: ["all", "customers", "kitchens", "admins"],
      default: "all",
      index: true,
    },
    status: {
      type: String,
      enum: ["draft", "scheduled", "published", "archived"],
      default: "draft",
      index: true,
    },
    publishAt: { type: Date, default: null },
    createdByUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    priority: { type: String, enum: ["low", "normal", "high"], default: "normal" },
  },
  { timestamps: true }
);

announcementSchema.index({ status: 1, audience: 1 });

const AnnouncementModel = mongoose.model("Announcement", announcementSchema);
module.exports = { AnnouncementModel };
