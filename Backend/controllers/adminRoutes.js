const express = require("express");

const { requireAuth, requireRole } = require("../middleware/auth");
const catchAsyncError = require("../middleware/catchAsyncError");
const ErrorHandler = require("../utils/errorhadler");
const { isAdminEmail } = require("../utils/adminAccess");

const { KitchenModel } = require("../model/kitchenModel");
const { UserModel } = require("../model/userModel");
const { MealModel } = require("../model/mealModel");
const { OrderModel } = require("../model/orderModel");
const { RatingModel } = require("../model/ratingModel");
const { ComplaintModel } = require("../model/complaintModel");
const { AnnouncementModel } = require("../model/announcementModel");
const { SettingModel } = require("../model/settingModel");

const adminRouter = express.Router();

adminRouter.use(requireAuth);
adminRouter.use(requireRole(["admin"]));
adminRouter.use((req, res, next) => {
  if (!req.user || !isAdminEmail(req.user.email)) {
    return next(new ErrorHandler("Forbidden: admin email required", 403));
  }
  return next();
});

// ADMIN: quick overview for dashboard cards
adminRouter.get(
  "/summary",
  catchAsyncError(async (req, res) => {
    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      pendingKitchens,
      verifiedKitchens,
      rejectedKitchens,
      activeKitchens,
      suspendedKitchens,
      totalOrders,
      pendingOrders,
      totalMeals,
      totalComplaints,
    ] = await Promise.all([
      UserModel.countDocuments(),
      UserModel.countDocuments({ isActivated: true }),
      UserModel.countDocuments({ isActivated: false }),
      KitchenModel.countDocuments({ verificationStatus: "pending" }),
      KitchenModel.countDocuments({ verificationStatus: "verified" }),
      KitchenModel.countDocuments({ verificationStatus: "rejected" }),
      KitchenModel.countDocuments({ isActive: true }),
      KitchenModel.countDocuments({ isActive: false }),
      OrderModel.countDocuments(),
      OrderModel.countDocuments({ status: "prebooked" }),
      MealModel.countDocuments(),
      ComplaintModel.countDocuments({ status: { $in: ["open", "investigating"] } }),
    ]);

    res.status(200).json({
      success: true,
      summary: {
        users: { total: totalUsers, active: activeUsers, suspended: suspendedUsers },
        kitchens: {
          pending: pendingKitchens,
          verified: verifiedKitchens,
          rejected: rejectedKitchens,
          active: activeKitchens,
          suspended: suspendedKitchens,
        },
        orders: { total: totalOrders, prebooked: pendingOrders },
        meals: { total: totalMeals },
        complaints: { open: totalComplaints },
      },
    });
  })
);

// ADMIN: users listing and activation toggles
adminRouter.get(
  "/users",
  catchAsyncError(async (req, res) => {
    const { status, limit = 200 } = req.query;
    const query = {};
    if (status === "active") query.isActivated = true;
    if (status === "suspended") query.isActivated = false;

    const users = await UserModel.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(Math.min(Number(limit) || 200, 500));

    res.status(200).json({ success: true, users });
  })
);

adminRouter.patch(
  "/users/:id/status",
  catchAsyncError(async (req, res, next) => {
    const { isActivated } = req.body;
    if (typeof isActivated !== "boolean") {
      return next(new ErrorHandler("isActivated (boolean) is required", 400));
    }

    const user = await UserModel.findByIdAndUpdate(
      req.params.id,
      { $set: { isActivated } },
      { new: true }
    ).select("-password");

    if (!user) return next(new ErrorHandler("User not found", 404));
    res.status(200).json({ success: true, user });
  })
);

// ADMIN: list kitchens with flexible filters
adminRouter.get(
  "/kitchens",
  catchAsyncError(async (req, res) => {
    const { status, limit = 200 } = req.query;
    const query = {};

    if (["pending", "verified", "rejected"].includes(status)) {
      query.verificationStatus = status;
    }
    if (status === "active") query.isActive = true;
    if (status === "suspended") query.isActive = false;

    const kitchens = await KitchenModel.find(query)
      .populate("ownerUserId", "name email role")
      .sort({ createdAt: -1 })
      .limit(Math.min(Number(limit) || 200, 500));

    res.status(200).json({ success: true, kitchens });
  })
);

// ADMIN: list kitchens pending verification
adminRouter.get(
  "/kitchens/pending",
  catchAsyncError(async (req, res) => {
    const kitchens = await KitchenModel.find({ verificationStatus: "pending" })
      .populate("ownerUserId", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, kitchens });
  })
);

// ADMIN: get full kitchen detail (owner, docs, statuses) for review
adminRouter.get(
  "/kitchens/:id",
  catchAsyncError(async (req, res, next) => {
    const kitchen = await KitchenModel.findById(req.params.id)
      .populate("ownerUserId", "name email phone role createdAt")
      .lean();

    if (!kitchen) return next(new ErrorHandler("Kitchen not found", 404));

    res.status(200).json({ success: true, kitchen });
  })
);

// ADMIN: approve/reject kitchen verification
adminRouter.patch(
  "/kitchens/:id/decision",
  catchAsyncError(async (req, res, next) => {
    const { decision, reason, verifiedBadge } = req.body;

    if (!decision || !["verified", "rejected"].includes(decision)) {
      return next(new ErrorHandler("decision must be 'verified' or 'rejected'", 400));
    }

    const update = {};

    if (decision === "verified") {
      update.verified = true;
      update.verificationStatus = "verified";
      update.verificationRejectedReason = "";
      update.verifiedAt = new Date();
      update.verifiedBadge = Boolean(verifiedBadge ?? true);

      // If admin approves, treat FSSAI validation as verified too
      update["fssai.validationStatus"] = "verified";
    }

    if (decision === "rejected") {
      if (!reason) return next(new ErrorHandler("reason is required when rejecting", 400));
      update.verified = false;
      update.verificationStatus = "rejected";
      update.verificationRejectedReason = String(reason);
      update.verifiedAt = null;
      update.verifiedBadge = false;
    }

    const kitchen = await KitchenModel.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
    if (!kitchen) return next(new ErrorHandler("Kitchen not found", 404));

    res.status(200).json({ success: true, kitchen });
  })
);

// ADMIN: explicitly set FSSAI validation status
adminRouter.patch(
  "/kitchens/:id/fssai",
  catchAsyncError(async (req, res, next) => {
    const { status, reason, notes } = req.body;
    if (!status || !["pending", "verified", "rejected"].includes(status)) {
      return next(new ErrorHandler("status must be pending/verified/rejected", 400));
    }

    const update = {
      "fssai.validationStatus": status,
      "fssai.validationNotes": notes || "",
    };

    if (status === "verified") {
      update["fssai.rejectionReason"] = "";
    }

    if (status === "rejected") {
      update["fssai.rejectionReason"] = reason || "";
    }

    const kitchen = await KitchenModel.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true }
    );

    if (!kitchen) return next(new ErrorHandler("Kitchen not found", 404));
    res.status(200).json({ success: true, kitchen });
  })
);

// ADMIN: verify/reject pincode
adminRouter.patch(
  "/kitchens/:id/location-decision",
  catchAsyncError(async (req, res, next) => {
    const { decision } = req.body;
    if (!decision || !["verified", "rejected", "pending"].includes(decision)) {
      return next(new ErrorHandler("decision must be 'verified', 'rejected', or 'pending'", 400));
    }

    const kitchen = await KitchenModel.findByIdAndUpdate(
      req.params.id,
      { $set: { pincodeVerificationStatus: decision } },
      { new: true }
    );

    if (!kitchen) return next(new ErrorHandler("Kitchen not found", 404));
    res.status(200).json({ success: true, kitchen });
  })
);

// ADMIN: schedule video call
adminRouter.patch(
  "/kitchens/:id/video-call/schedule",
  catchAsyncError(async (req, res, next) => {
    const { scheduledAt } = req.body;
    if (!scheduledAt) return next(new ErrorHandler("scheduledAt is required", 400));

    const dt = new Date(scheduledAt);
    if (Number.isNaN(dt.getTime())) return next(new ErrorHandler("scheduledAt must be a valid datetime", 400));

    const kitchen = await KitchenModel.findByIdAndUpdate(
      req.params.id,
      { $set: { "videoCall.status": "scheduled", "videoCall.scheduledAt": dt } },
      { new: true }
    );

    if (!kitchen) return next(new ErrorHandler("Kitchen not found", 404));
    res.status(200).json({ success: true, kitchen });
  })
);

// ADMIN: set trial order result
adminRouter.patch(
  "/kitchens/:id/premium-trial",
  catchAsyncError(async (req, res, next) => {
    const { status, notes } = req.body;
    if (!status || !["requested", "passed", "failed", "not_requested"].includes(status)) {
      return next(new ErrorHandler("status must be one of not_requested/requested/passed/failed", 400));
    }

    const kitchen = await KitchenModel.findByIdAndUpdate(
      req.params.id,
      { $set: { "premiumVerification.trialOrderStatus": status, "premiumVerification.notes": notes || "" } },
      { new: true }
    );

    if (!kitchen) return next(new ErrorHandler("Kitchen not found", 404));
    res.status(200).json({ success: true, kitchen });
  })
);

// ADMIN: suspend/unsuspend a kitchen
adminRouter.patch(
  "/kitchens/:id/suspend",
  catchAsyncError(async (req, res, next) => {
    const { isActive } = req.body;
    const kitchen = await KitchenModel.findByIdAndUpdate(req.params.id, { $set: { isActive: Boolean(isActive) } }, { new: true });
    if (!kitchen) return next(new ErrorHandler("Kitchen not found", 404));
    res.status(200).json({ success: true, kitchen });
  })
);

// ADMIN: read-only view of orders
adminRouter.get(
  "/orders",
  catchAsyncError(async (req, res) => {
    const { status, kitchenId, limit = 100 } = req.query;
    const query = {};
    if (status && ["prebooked", "accepted", "rejected", "cancelled", "fulfilled"].includes(status)) {
      query.status = status;
    }
    if (kitchenId) query.kitchenId = kitchenId;

    const orders = await OrderModel.find(query)
      .populate("userId", "name email role")
      .populate("kitchenId", "name verificationStatus")
      .populate("mealId", "title mealType price")
      .sort({ createdAt: -1 })
      .limit(Math.min(Number(limit) || 100, 500));

    res.status(200).json({ success: true, orders });
  })
);

// ADMIN: read-only menu oversight
adminRouter.get(
  "/menus",
  catchAsyncError(async (req, res) => {
    const { kitchenId, limit = 200 } = req.query;
    const query = {};
    if (kitchenId) query.kitchenId = kitchenId;

    const meals = await MealModel.find(query)
      .populate("kitchenId", "name verificationStatus isActive")
      .sort({ createdAt: -1 })
      .limit(Math.min(Number(limit) || 200, 500));

    res.status(200).json({ success: true, meals });
  })
);

// ADMIN: reviews oversight
adminRouter.get(
  "/reviews",
  catchAsyncError(async (req, res) => {
    const { kitchenId, limit = 200 } = req.query;
    const query = {};
    if (kitchenId) query.kitchenId = kitchenId;

    const reviews = await RatingModel.find(query)
      .populate("userId", "name email")
      .populate("kitchenId", "name")
      .sort({ createdAt: -1 })
      .limit(Math.min(Number(limit) || 200, 500));

    res.status(200).json({ success: true, reviews });
  })
);

// ADMIN: complaints and policy violations
adminRouter.get(
  "/complaints",
  catchAsyncError(async (req, res) => {
    const { status, type, severity, limit = 200 } = req.query;
    const query = {};
    if (status && ["open", "investigating", "resolved", "rejected"].includes(status)) query.status = status;
    if (type && ["complaint", "policy_violation", "review_flag"].includes(type)) query.type = type;
    if (severity && ["low", "medium", "high", "critical"].includes(severity)) query.severity = severity;

    const complaints = await ComplaintModel.find(query)
      .populate("reporterUserId", "name email role")
      .populate("kitchenId", "name")
      .populate("orderId", "status date")
      .sort({ createdAt: -1 })
      .limit(Math.min(Number(limit) || 200, 500));

    res.status(200).json({ success: true, complaints });
  })
);

adminRouter.post(
  "/complaints",
  catchAsyncError(async (req, res, next) => {
    const { message, type, status, severity, labels, reporterUserId, kitchenId, orderId, category } = req.body;
    if (!message) return next(new ErrorHandler("message is required", 400));

    const complaint = await ComplaintModel.create({
      message,
      type: type && ["complaint", "policy_violation", "review_flag"].includes(type) ? type : "complaint",
      status: status && ["open", "investigating", "resolved", "rejected"].includes(status) ? status : undefined,
      severity: severity && ["low", "medium", "high", "critical"].includes(severity) ? severity : undefined,
      labels: Array.isArray(labels) ? labels : [],
      reporterUserId: reporterUserId || null,
      kitchenId: kitchenId || null,
      orderId: orderId || null,
      category: category || "",
    });

    res.status(201).json({ success: true, complaint });
  })
);

adminRouter.patch(
  "/complaints/:id/status",
  catchAsyncError(async (req, res, next) => {
    const { status, adminNotes, severity, labels } = req.body;
    const update = {};

    if (status) {
      if (!["open", "investigating", "resolved", "rejected"].includes(status)) {
        return next(new ErrorHandler("status must be open/investigating/resolved/rejected", 400));
      }
      update.status = status;
    }
    if (severity) {
      if (!["low", "medium", "high", "critical"].includes(severity)) {
        return next(new ErrorHandler("invalid severity", 400));
      }
      update.severity = severity;
    }
    if (typeof adminNotes === "string") update.adminNotes = adminNotes;
    if (Array.isArray(labels)) update.labels = labels;

    if (Object.keys(update).length === 0) {
      return next(new ErrorHandler("No update fields provided", 400));
    }

    const complaint = await ComplaintModel.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
    if (!complaint) return next(new ErrorHandler("Complaint not found", 404));

    res.status(200).json({ success: true, complaint });
  })
);

// ADMIN: announcements
adminRouter.get(
  "/announcements",
  catchAsyncError(async (req, res) => {
    const { status, audience, limit = 100 } = req.query;
    const query = {};
    if (status && ["draft", "scheduled", "published", "archived"].includes(status)) query.status = status;
    if (audience && ["all", "customers", "kitchens", "admins"].includes(audience)) query.audience = audience;

    const announcements = await AnnouncementModel.find(query)
      .sort({ updatedAt: -1 })
      .limit(Math.min(Number(limit) || 100, 300));

    res.status(200).json({ success: true, announcements });
  })
);

adminRouter.post(
  "/announcements",
  catchAsyncError(async (req, res, next) => {
    const { title, body, audience = "all", status = "draft", publishAt, priority = "normal" } = req.body;
    if (!title || !body) return next(new ErrorHandler("title and body are required", 400));

    const announcement = await AnnouncementModel.create({
      title,
      body,
      audience,
      status,
      priority,
      publishAt: publishAt ? new Date(publishAt) : null,
      createdByUserId: req.user._id,
    });

    res.status(201).json({ success: true, announcement });
  })
);

adminRouter.patch(
  "/announcements/:id",
  catchAsyncError(async (req, res, next) => {
    const { title, body, status, audience, publishAt, priority } = req.body;
    const update = {};
    if (title) update.title = title;
    if (body) update.body = body;
    if (priority && ["low", "normal", "high"].includes(priority)) update.priority = priority;
    if (audience && ["all", "customers", "kitchens", "admins"].includes(audience)) update.audience = audience;
    if (status && ["draft", "scheduled", "published", "archived"].includes(status)) update.status = status;
    if (publishAt !== undefined) update.publishAt = publishAt ? new Date(publishAt) : null;

    if (Object.keys(update).length === 0) {
      return next(new ErrorHandler("No update fields provided", 400));
    }

    const announcement = await AnnouncementModel.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
    if (!announcement) return next(new ErrorHandler("Announcement not found", 404));

    res.status(200).json({ success: true, announcement });
  })
);

// ADMIN: platform settings key/value pairs
adminRouter.get(
  "/settings",
  catchAsyncError(async (req, res) => {
    const settings = await SettingModel.find({}).sort({ key: 1 });
    res.status(200).json({ success: true, settings });
  })
);

adminRouter.put(
  "/settings/:key",
  catchAsyncError(async (req, res, next) => {
    const { value } = req.body;
    if (typeof value === "undefined") return next(new ErrorHandler("value is required", 400));

    const setting = await SettingModel.findOneAndUpdate(
      { key: req.params.key },
      { $set: { value, updatedByUserId: req.user._id } },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, setting });
  })
);

module.exports = { adminRouter };
