const express = require("express");

const { requireAuth } = require("../middleware/auth");
const catchAsyncError = require("../middleware/catchAsyncError");
const ErrorHandler = require("../utils/errorhadler");
const { parseDateOnlyUTC } = require("../utils/date");

const { SubscriptionPlanModel } = require("../model/subscriptionPlanModel");
const { UserSubscriptionModel } = require("../model/userSubscriptionModel");

const subscriptionRouter = express.Router();

// CUSTOMER: List subscription plans (weekly/monthly)
subscriptionRouter.get(
  "/plans",
  catchAsyncError(async (req, res) => {
    let plans = await SubscriptionPlanModel.find({ isActive: true }).sort({ planType: 1, mealsPerDay: 1 });

    // Ensure basic plans exist for MVP
    if (!plans || plans.length === 0) {
      const defaults = [
        { planType: "weekly", mealsPerDay: 1, price: 999 },
        { planType: "weekly", mealsPerDay: 2, price: 1799 },
        { planType: "weekly", mealsPerDay: 3, price: 2499 },
        { planType: "monthly", mealsPerDay: 1, price: 3499 },
        { planType: "monthly", mealsPerDay: 2, price: 6499 },
        { planType: "monthly", mealsPerDay: 3, price: 8999 },
      ];

      for (const p of defaults) {
        await SubscriptionPlanModel.updateOne(
          { planType: p.planType, mealsPerDay: p.mealsPerDay },
          { $setOnInsert: { ...p, isActive: true } },
          { upsert: true }
        );
      }

      plans = await SubscriptionPlanModel.find({ isActive: true }).sort({ planType: 1, mealsPerDay: 1 });
    }
    res.status(200).json({ success: true, plans });
  })
);

// CUSTOMER: Subscribe
subscriptionRouter.post(
  "/subscribe",
  requireAuth,
  catchAsyncError(async (req, res, next) => {
    const { planId, startDate } = req.body;
    if (!planId) return next(new ErrorHandler("planId is required", 400));

    const plan = await SubscriptionPlanModel.findById(planId);
    if (!plan || !plan.isActive) return next(new ErrorHandler("Plan not found", 404));

    const start = parseDateOnlyUTC(startDate);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + (plan.planType === "weekly" ? 7 : 30));

    const sub = await UserSubscriptionModel.create({
      userId: req.user._id,
      planId: plan._id,
      startDate: start,
      endDate: end,
      status: "active",
    });

    res.status(201).json({ success: true, subscription: sub });
  })
);

// CUSTOMER: My subscriptions
subscriptionRouter.get(
  "/my",
  requireAuth,
  catchAsyncError(async (req, res) => {
    const subs = await UserSubscriptionModel.find({ userId: req.user._id })
      .populate("planId", "planType mealsPerDay price")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, subscriptions: subs });
  })
);

module.exports = { subscriptionRouter };
