const express = require("express");
const { requireAuth } = require("../middleware/auth");
const catchAsyncError = require("../middleware/catchAsyncError");
const ErrorHandler = require("../utils/errorhadler");
const { parseDateOnlyUTC } = require("../utils/date");

const { KitchenModel } = require("../model/kitchenModel");
const { MealModel } = require("../model/mealModel");
const { OrderModel } = require("../model/orderModel");

const orderRouter = express.Router();

// CUSTOMER: Pre-book a meal
orderRouter.post(
  "/prebook",
  requireAuth,
  catchAsyncError(async (req, res, next) => {
    const { kitchenId, date, mealType, qty, paymentMethod } = req.body;

    if (!kitchenId || !date || !mealType || !qty) {
      return next(new ErrorHandler("kitchenId, date, mealType, qty are required", 400));
    }

    const allowedTypes = ["breakfast", "lunch", "snacks", "dinner"];
    if (!allowedTypes.includes(mealType)) {
      return next(new ErrorHandler("mealType must be breakfast, lunch, snacks, or dinner", 400));
    }

    const allowedPayment = ["upi", "card"];
    if (paymentMethod && !allowedPayment.includes(paymentMethod)) {
      return next(new ErrorHandler("paymentMethod must be upi or card", 400));
    }

    const qtyNum = Number(qty);
    if (Number.isNaN(qtyNum) || qtyNum < 1) return next(new ErrorHandler("qty must be >= 1", 400));

    const day = parseDateOnlyUTC(date);

    const kitchen = await KitchenModel.findById(kitchenId);
    if (!kitchen || !kitchen.isActive) return next(new ErrorHandler("Kitchen not found", 404));

    // Daily order limit check (based on the meal date being served)
    const orderCount = await OrderModel.countDocuments({
      kitchenId: kitchen._id,
      date: day,
      status: { $ne: "cancelled" },
    });

    if (kitchen.dailyOrderLimit !== undefined && orderCount >= kitchen.dailyOrderLimit) {
      return next(new ErrorHandler("Kitchen has reached its daily order limit", 400));
    }

    // Atomically reserve quantity if available
    const meal = await MealModel.findOneAndUpdate(
      {
        kitchenId: kitchen._id,
        date: day,
        mealType,
        isAvailable: true,
        $expr: { $gte: [{ $subtract: ["$totalQty", "$soldQty"] }, qtyNum] },
      },
      { $inc: { soldQty: qtyNum } },
      { new: true }
    );

    if (!meal) {
      return next(new ErrorHandler("Meal unavailable or insufficient quantity", 400));
    }

    const order = await OrderModel.create({
      userId: req.user._id,
      kitchenId: kitchen._id,
      mealId: meal._id,
      date: day,
      mealType,
      qty: qtyNum,
      status: "prebooked",
      ...(paymentMethod ? { paymentMethod } : {}),
    });

    res.status(201).json({ success: true, order, meal });
  })
);

// CUSTOMER: My orders
orderRouter.get(
  "/my",
  requireAuth,
  catchAsyncError(async (req, res) => {
    const orders = await OrderModel.find({ userId: req.user._id })
      .populate("kitchenId", "name verified")
      .populate("mealId", "title price mealType")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  })
);

// CUSTOMER: Cancel a pre-booked order
orderRouter.patch(
  "/:id/cancel",
  requireAuth,
  catchAsyncError(async (req, res, next) => {
    const order = await OrderModel.findOne({ _id: req.params.id, userId: req.user._id });
    if (!order) return next(new ErrorHandler("Order not found", 404));
    if (order.status !== "prebooked") return next(new ErrorHandler("Only prebooked orders can be cancelled", 400));

    // Avoid Mongo transactions (often unavailable on local standalone instances)
    order.status = "cancelled";
    await order.save();
    await MealModel.updateOne({ _id: order.mealId }, { $inc: { soldQty: -order.qty } });

    res.status(200).json({ success: true, order });
  })
);

// CUSTOMER: set payment method after prebook
orderRouter.patch(
  "/:id/payment-method",
  requireAuth,
  catchAsyncError(async (req, res, next) => {
    const { paymentMethod } = req.body;
    const allowedPayment = ["upi", "card"];
    if (!paymentMethod || !allowedPayment.includes(paymentMethod)) {
      return next(new ErrorHandler("paymentMethod must be upi or card", 400));
    }

    const order = await OrderModel.findOne({ _id: req.params.id, userId: req.user._id });
    if (!order) return next(new ErrorHandler("Order not found", 404));
    if (order.status !== "prebooked") return next(new ErrorHandler("Payment can only be set for prebooked orders", 400));

    order.paymentMethod = paymentMethod;
    await order.save();

    res.status(200).json({ success: true, order });
  })
);

module.exports = { orderRouter };
