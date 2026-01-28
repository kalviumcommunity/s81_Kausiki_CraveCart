const express = require("express");
const mongoose = require("mongoose");

const { KitchenModel } = require("../model/kitchenModel");
const { MealModel } = require("../model/mealModel");
const { RatingModel } = require("../model/ratingModel");
const { OrderModel } = require("../model/orderModel");
const { UserModel } = require("../model/userModel");

const ErrorHandler = require("../utils/errorhadler");
const catchAsyncError = require("../middleware/catchAsyncError");
const { requireAuth, requireRole } = require("../middleware/auth");
const { parseDateOnlyUTC } = require("../utils/date");
const { upload, buildFileDoc } = require("../middleware/multer");

const kitchenRouter = express.Router();

// CUSTOMER: Browse verified kitchens
kitchenRouter.get(
  "/",
  requireAuth,
  catchAsyncError(async (req, res) => {
    const verifiedOnly = req.query.verified !== "false";

    const kitchens = await KitchenModel.find({
      isActive: true,
      ...(verifiedOnly ? { verified: true } : {}),
    }).sort({ createdAt: -1 });

    // Attach avg rating + count (simple aggregate)
    const kitchenIds = kitchens.map((k) => k._id);
    const ratingAgg = await RatingModel.aggregate([
      { $match: { kitchenId: { $in: kitchenIds } } },
      {
        $group: {
          _id: "$kitchenId",
          avgRating: { $avg: "$rating" },
          ratingCount: { $sum: 1 },
        },
      },
    ]);

    const ratingMap = new Map(
      ratingAgg.map((r) => [String(r._id), { avgRating: r.avgRating, ratingCount: r.ratingCount }])
    );

    const result = kitchens.map((k) => {
      const stats = ratingMap.get(String(k._id)) || { avgRating: 0, ratingCount: 0 };
      return { ...k.toObject(), ...stats };
    });

    res.status(200).json({ success: true, kitchens: result });
  })
);

// CUSTOMER: Kitchen details
kitchenRouter.get(
  "/:id",
  requireAuth,
  catchAsyncError(async (req, res, next) => {
    const kitchen = await KitchenModel.findById(req.params.id);
    if (!kitchen) return next(new ErrorHandler("Kitchen not found", 404));

    const ratingAgg = await RatingModel.aggregate([
      { $match: { kitchenId: kitchen._id } },
      {
        $group: {
          _id: "$kitchenId",
          avgRating: { $avg: "$rating" },
          ratingCount: { $sum: 1 },
        },
      },
    ]);

    const stats = ratingAgg[0] || { avgRating: 0, ratingCount: 0 };

    res.status(200).json({
      success: true,
      kitchen: { ...kitchen.toObject(), avgRating: stats.avgRating || 0, ratingCount: stats.ratingCount || 0 },
    });
  })
);

// CUSTOMER: Real-time availability for a kitchen (by date)
kitchenRouter.get(
  "/:id/availability",
  requireAuth,
  catchAsyncError(async (req, res, next) => {
    const kitchenId = req.params.id;
    const date = parseDateOnlyUTC(req.query.date);

    const kitchen = await KitchenModel.findById(kitchenId);
    if (!kitchen) return next(new ErrorHandler("Kitchen not found", 404));

    const meals = await MealModel.find({ kitchenId, date }).sort({ mealType: 1 });
    res.status(200).json({ success: true, date, meals });
  })
);

// CUSTOMER: Add/update rating & feedback for a kitchen
kitchenRouter.post(
  "/:id/rating",
  requireAuth,
  catchAsyncError(async (req, res, next) => {
    const kitchenId = req.params.id;
    const { rating, feedback } = req.body;

    if (!rating) return next(new ErrorHandler("rating is required", 400));
    const ratingNum = Number(rating);
    if (Number.isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return next(new ErrorHandler("rating must be between 1 and 5", 400));
    }

    const kitchen = await KitchenModel.findById(kitchenId);
    if (!kitchen) return next(new ErrorHandler("Kitchen not found", 404));

    const doc = await RatingModel.findOneAndUpdate(
      { userId: req.user._id, kitchenId },
      { $set: { rating: ratingNum, feedback: feedback || "" } },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, rating: doc });
  })
);

// KITCHEN: Register your kitchen (starts as Pending Verification)
kitchenRouter.post(
  "/register",
  requireAuth,
  catchAsyncError(async (req, res, next) => {
    const { name, description, addressText } = req.body;
    if (!name) return next(new ErrorHandler("name is required", 400));

    const existing = await KitchenModel.findOne({ ownerUserId: req.user._id });
    if (existing) return next(new ErrorHandler("Kitchen already registered for this account", 400));

    const kitchen = await KitchenModel.create({
      ownerUserId: req.user._id,
      name,
      description: description || "",
      addressText: addressText || "",
      verified: false,
      verificationStatus: "pending",
    });

    await UserModel.findByIdAndUpdate(req.user._id, { $set: { role: "kitchen" } });

    res.status(201).json({ success: true, kitchen });
  })
);

// KITCHEN: Upload mandatory verification docs + live photos/video + FSSAI details
kitchenRouter.post(
  "/my/verification",
  requireAuth,
  // Don't role-gate onboarding; ownership is enforced by querying by ownerUserId
  upload.fields([
    { name: "fssaiCertificate", maxCount: 1 },
    { name: "governmentId", maxCount: 1 },
    { name: "kitchenPhotos", maxCount: 5 },
  ]),
  catchAsyncError(async (req, res, next) => {
    const kitchen = await KitchenModel.findOne({ ownerUserId: req.user._id });
    if (!kitchen) return next(new ErrorHandler("Kitchen not found for this account", 404));

    const {
      fssaiLicenseNumber,
      fssaiBusinessName,
      fssaiExpiryDate,
      governmentIdType,
      nameOnId,
    } = req.body;

    if (!fssaiLicenseNumber) return next(new ErrorHandler("FSSAI License Number is required", 400));
    if (!String(fssaiLicenseNumber).match(/^\d{14}$/)) {
      return next(new ErrorHandler("FSSAI License Number must be 14 digits", 400));
    }
    if (!fssaiExpiryDate) return next(new ErrorHandler("FSSAI Expiry Date is required", 400));
    const expiry = new Date(fssaiExpiryDate);
    if (Number.isNaN(expiry.getTime())) return next(new ErrorHandler("Invalid FSSAI Expiry Date", 400));
    if (expiry.getTime() < Date.now()) return next(new ErrorHandler("FSSAI License is expired", 400));

    if (!governmentIdType) return next(new ErrorHandler("Government ID type is required", 400));
    if (!nameOnId) return next(new ErrorHandler("Name on ID is required", 400));

    const files = req.files || {};
    const fssaiFile = files.fssaiCertificate?.[0];
    const govIdFile = files.governmentId?.[0];
    const photos = files.kitchenPhotos || [];

    if (!fssaiFile || !govIdFile) {
      return next(new ErrorHandler("FSSAI certificate and Government ID are mandatory", 400));
    }

    // Basic clarity check: minimum size
    const minDocBytes = 10 * 1024;
    if (fssaiFile.size < minDocBytes || govIdFile.size < minDocBytes) {
      return next(new ErrorHandler("Uploaded documents are too small/unclear", 400));
    }

    kitchen.fssai.licenseNumber = String(fssaiLicenseNumber);
    kitchen.fssai.businessName = String(fssaiBusinessName || "");
    kitchen.fssai.expiryDate = expiry;
    kitchen.fssai.validationStatus = "pending";

    kitchen.documents.fssaiCertificate = buildFileDoc(fssaiFile);
    kitchen.documents.governmentId = {
      ...buildFileDoc(govIdFile),
      idType: String(governmentIdType),
      nameOnId: String(nameOnId),
    };

    if (photos.length > 0) {
      kitchen.documents.kitchenPhotos = photos.map((p) => buildFileDoc(p));
    }

    kitchen.verificationStatus = "pending";
    kitchen.verificationRejectedReason = "";
    kitchen.verified = false;

    await kitchen.save();
    res.status(200).json({ success: true, kitchen });
  })
);

// KITCHEN: Set service pincode
kitchenRouter.patch(
  "/my/location",
  requireAuth,
  catchAsyncError(async (req, res, next) => {
    const { pincode, addressText } = req.body;
    const normalizedPincode = String(pincode || "").trim();

    if (!normalizedPincode) {
      return next(new ErrorHandler("pincode is required", 400));
    }
    if (!/^\d{4,10}$/.test(normalizedPincode)) {
      return next(new ErrorHandler("pincode must be 4-10 digits", 400));
    }

    const kitchen = await KitchenModel.findOneAndUpdate(
      { ownerUserId: req.user._id },
      {
        $set: {
          pincode: normalizedPincode,
          ...(addressText !== undefined ? { addressText: String(addressText) } : {}),
          // Auto-verify pincode (no manual admin step)
          pincodeVerificationStatus: "verified",
        },
      },
      { new: true }
    );

    if (!kitchen) return next(new ErrorHandler("Kitchen not found for this account", 404));
    res.status(200).json({ success: true, kitchen });
  })
);

// KITCHEN: Request video call verification
kitchenRouter.post(
  "/my/video-call/request",
  requireAuth,
  catchAsyncError(async (req, res, next) => {
    const { preferredSlotText } = req.body;
    if (!preferredSlotText) return next(new ErrorHandler("preferredSlotText is required", 400));

    const kitchen = await KitchenModel.findOneAndUpdate(
      { ownerUserId: req.user._id },
      { $set: { "videoCall.status": "requested", "videoCall.preferredSlotText": String(preferredSlotText) } },
      { new: true }
    );

    if (!kitchen) return next(new ErrorHandler("Kitchen not found for this account", 404));
    res.status(200).json({ success: true, kitchen });
  })
);

// KITCHEN: Request premium verification trial order
kitchenRouter.post(
  "/my/premium-verification/trial-order",
  requireAuth,
  catchAsyncError(async (req, res, next) => {
    const { notes } = req.body;
    const kitchen = await KitchenModel.findOneAndUpdate(
      { ownerUserId: req.user._id },
      { $set: { "premiumVerification.trialOrderStatus": "requested", "premiumVerification.notes": notes || "" } },
      { new: true }
    );

    if (!kitchen) return next(new ErrorHandler("Kitchen not found for this account", 404));
    res.status(200).json({ success: true, kitchen });
  })
);

// KITCHEN: Get my kitchen
kitchenRouter.get(
  "/my/profile",
  requireAuth,
  requireRole(["kitchen", "admin"]),
  catchAsyncError(async (req, res, next) => {
    const kitchen = await KitchenModel.findOne({ ownerUserId: req.user._id });
    if (!kitchen) return next(new ErrorHandler("Kitchen not found for this account", 404));

    const hasMenuItems = await MealModel.exists({ kitchenId: kitchen._id });

    res.status(200).json({ success: true, kitchen, hasMenuItems: Boolean(hasMenuItems) });
  })
);

// KITCHEN: Set daily order limit
kitchenRouter.patch(
  "/my/daily-order-limit",
  requireAuth,
  requireRole(["kitchen", "admin"]),
  catchAsyncError(async (req, res, next) => {
    const { dailyOrderLimit } = req.body;
    const limitNum = Number(dailyOrderLimit);
    if (Number.isNaN(limitNum) || limitNum < 0) return next(new ErrorHandler("dailyOrderLimit must be >= 0", 400));

    const kitchen = await KitchenModel.findOneAndUpdate(
      { ownerUserId: req.user._id },
      { $set: { dailyOrderLimit: limitNum } },
      { new: true }
    );

    if (!kitchen) return next(new ErrorHandler("Kitchen not found for this account", 404));

    res.status(200).json({ success: true, kitchen });
  })
);

// KITCHEN: Create/update meal availability (manage pre-orders efficiently)
kitchenRouter.post(
  "/my/meals/image",
  requireAuth,
  requireRole(["kitchen", "admin"]),
  upload.single("image"),
  catchAsyncError(async (req, res, next) => {
    if (!req.file) return next(new ErrorHandler("image is required", 400));
    const fileDoc = buildFileDoc(req.file);
    res.status(201).json({ success: true, file: fileDoc });
  })
);

kitchenRouter.post(
  "/my/meals",
  requireAuth,
  requireRole(["kitchen", "admin"]),
  catchAsyncError(async (req, res, next) => {
    const { date, mealType, title, description, imageUrl, price, totalQty, isAvailable } = req.body;

    if (!date || !mealType || !title || price === undefined || totalQty === undefined) {
      return next(new ErrorHandler("date, mealType, title, price, totalQty are required", 400));
    }

    const day = parseDateOnlyUTC(date);

    const kitchen = await KitchenModel.findOne({ ownerUserId: req.user._id });
    if (!kitchen) return next(new ErrorHandler("Kitchen not found for this account", 404));
    if (!kitchen.verified) return next(new ErrorHandler("Kitchen verification pending. Menu management is locked", 403));

    const meal = await MealModel.findOneAndUpdate(
      { kitchenId: kitchen._id, date: day, mealType },
      {
        $set: {
          title,
          description: description || "",
          imageUrl: imageUrl || "",
          price: Number(price),
          totalQty: Number(totalQty),
          isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
        },
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, meal });
  })
);

kitchenRouter.get(
  "/my/meals",
  requireAuth,
  requireRole(["kitchen", "admin"]),
  catchAsyncError(async (req, res, next) => {
    const day = parseDateOnlyUTC(req.query.date);

    const kitchen = await KitchenModel.findOne({ ownerUserId: req.user._id });
    if (!kitchen) return next(new ErrorHandler("Kitchen not found for this account", 404));
    if (!kitchen.verified) return next(new ErrorHandler("Kitchen verification pending. Menu management is locked", 403));

    const meals = await MealModel.find({ kitchenId: kitchen._id, date: day }).sort({ mealType: 1, createdAt: -1 });
    res.status(200).json({ success: true, date: day, meals });
  })
);

// KITCHEN: View pre-orders
kitchenRouter.get(
  "/my/orders",
  requireAuth,
  requireRole(["kitchen", "admin"]),
  catchAsyncError(async (req, res, next) => {
    const day = parseDateOnlyUTC(req.query.date);
    const kitchen = await KitchenModel.findOne({ ownerUserId: req.user._id });
    if (!kitchen) return next(new ErrorHandler("Kitchen not found for this account", 404));

    if (!kitchen.verified) return next(new ErrorHandler("Kitchen verification pending. Orders dashboard is locked", 403));

    const orders = await OrderModel.find({
      kitchenId: kitchen._id,
      date: day,
      status: { $in: ["prebooked", "accepted", "rejected"] },
    })
      .populate("userId", "name email")
      .populate("mealId", "title mealType price")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, date: day, orders });
  })
);

// KITCHEN: Accept or reject an order
kitchenRouter.patch(
  "/my/orders/:id/decision",
  requireAuth,
  requireRole(["kitchen", "admin"]),
  catchAsyncError(async (req, res, next) => {
    const { decision } = req.body;
    if (!decision || !["accept", "reject"].includes(String(decision).toLowerCase())) {
      return next(new ErrorHandler("decision must be 'accept' or 'reject'", 400));
    }

    const kitchen = await KitchenModel.findOne({ ownerUserId: req.user._id });
    if (!kitchen) return next(new ErrorHandler("Kitchen not found for this account", 404));
    if (!kitchen.verified) return next(new ErrorHandler("Kitchen verification pending. Orders dashboard is locked", 403));

    const order = await OrderModel.findOne({ _id: req.params.id, kitchenId: kitchen._id });
    if (!order) return next(new ErrorHandler("Order not found", 404));
    if (!['prebooked','accepted','rejected'].includes(order.status)) {
      return next(new ErrorHandler("Only pending orders can be decided", 400));
    }

    if (decision === "accept") {
      order.status = "accepted";
      await order.save();
      return res.status(200).json({ success: true, order });
    }

    // reject: free the reserved quantity and mark rejected
    order.status = "rejected";
    await order.save();

    await MealModel.updateOne({ _id: order.mealId }, { $inc: { soldQty: -order.qty } });

    return res.status(200).json({ success: true, order });
  })
);

// KITCHEN: Analyze demand patterns
kitchenRouter.get(
  "/my/analytics",
  requireAuth,
  requireRole(["kitchen", "admin"]),
  catchAsyncError(async (req, res, next) => {
    const days = Math.min(90, Math.max(1, Number(req.query.days || 30)));

    const kitchen = await KitchenModel.findOne({ ownerUserId: req.user._id });
    if (!kitchen) return next(new ErrorHandler("Kitchen not found for this account", 404));

    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const demand = await OrderModel.aggregate([
      {
        $match: {
          kitchenId: new mongoose.Types.ObjectId(kitchen._id),
          createdAt: { $gte: since },
          status: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: {
            day: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            mealType: "$mealType",
          },
          orders: { $sum: 1 },
          qty: { $sum: "$qty" },
        },
      },
      { $sort: { "_id.day": 1 } },
    ]);

    res.status(200).json({ success: true, days, demand });
  })
);

module.exports = { kitchenRouter };
