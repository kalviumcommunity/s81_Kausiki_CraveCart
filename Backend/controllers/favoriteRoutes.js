const express = require("express");

const { requireAuth } = require("../middleware/auth");
const catchAsyncError = require("../middleware/catchAsyncError");
const ErrorHandler = require("../utils/errorhadler");

const { UserModel } = require("../model/userModel");
const { KitchenModel } = require("../model/kitchenModel");

const favoriteRouter = express.Router();

// CUSTOMER: List favorite kitchens
favoriteRouter.get(
  "/my",
  requireAuth,
  catchAsyncError(async (req, res) => {
    const user = await UserModel.findById(req.user._id).populate("favoriteKitchens", "name verified isActive");
    res.status(200).json({ success: true, favorites: user.favoriteKitchens || [] });
  })
);

// CUSTOMER: Toggle favorite kitchen
favoriteRouter.post(
  "/:kitchenId/toggle",
  requireAuth,
  catchAsyncError(async (req, res, next) => {
    const { kitchenId } = req.params;

    const kitchen = await KitchenModel.findById(kitchenId);
    if (!kitchen) return next(new ErrorHandler("Kitchen not found", 404));

    const user = await UserModel.findById(req.user._id);
    const exists = (user.favoriteKitchens || []).some((id) => String(id) === String(kitchenId));

    if (exists) {
      await UserModel.updateOne({ _id: req.user._id }, { $pull: { favoriteKitchens: kitchenId } });
    } else {
      await UserModel.updateOne({ _id: req.user._id }, { $addToSet: { favoriteKitchens: kitchenId } });
    }

    const updated = await UserModel.findById(req.user._id).populate("favoriteKitchens", "name verified isActive");

    res.status(200).json({ success: true, isFavorite: !exists, favorites: updated.favoriteKitchens || [] });
  })
);

module.exports = { favoriteRouter };
