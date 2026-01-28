const mongoose = require("mongoose");

const kitchenSchema = new mongoose.Schema(
  {
    ownerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    verified: { type: Boolean, default: false, index: true },

    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
      index: true,
    },
    verificationRejectedReason: { type: String, default: "" },
    verifiedBadge: { type: Boolean, default: false },
    verifiedAt: { type: Date, default: null },

    addressText: { type: String, default: "" },

    pincode: { type: String, default: "", trim: true },
    pincodeVerificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",


    },

    dailyOrderLimit: { type: Number, default: 50, min: 0 },
    isActive: { type: Boolean, default: true },

    // Verification inputs
    fssai: {
      licenseNumber: { type: String, default: "" },
      businessName: { type: String, default: "" },
      expiryDate: { type: Date, default: null },
      validationStatus: {
        type: String,
        enum: ["pending", "verified", "rejected"],
        default: "pending",
      },
      rejectionReason: { type: String, default: "" },
      validationNotes: { type: String, default: "" },
    },
    documents: {
      fssaiCertificate: {
        originalName: String,
        fileName: String,
        mimeType: String,
        size: Number,
        path: String,
        urlPath: String,
        uploadedAt: Date,
      },
      governmentId: {
        idType: { type: String, default: "" },
        nameOnId: { type: String, default: "" },
        originalName: String,
        fileName: String,
        mimeType: String,
        size: Number,
        path: String,
        urlPath: String,
        uploadedAt: Date,
      },
      kitchenPhotos: [
        {
          originalName: String,
          fileName: String,
          mimeType: String,
          size: Number,
          path: String,
          urlPath: String,
          uploadedAt: Date,
        },
      ],
      kitchenVideo: {
        originalName: String,
        fileName: String,
        mimeType: String,
        size: Number,
        path: String,
        urlPath: String,
        uploadedAt: Date,
      },
    },

    videoCall: {
      status: { type: String, enum: ["not_requested", "requested", "scheduled", "completed"], default: "not_requested" },
      preferredSlotText: { type: String, default: "" },
      scheduledAt: { type: Date, default: null },
    },
    premiumVerification: {
      trialOrderStatus: {
        type: String,
        enum: ["not_requested", "requested", "passed", "failed"],
        default: "not_requested",
      },
      notes: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

const KitchenModel = mongoose.model("Kitchen", kitchenSchema);
module.exports = { KitchenModel };
