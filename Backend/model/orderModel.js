const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    kitchenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Kitchen",
      required: true,
      index: true,
    },
    mealId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meal",
      required: true,
      index: true,
    },
    date: { type: Date, required: true, index: true },
    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "snacks", "dinner"],
      required: true,
      index: true,
    },
    qty: { type: Number, required: true, min: 1 },

    status: {
      type: String,
      enum: ["prebooked", "accepted", "rejected", "cancelled", "fulfilled"],
      default: "prebooked",
      index: true,
    },

    paymentMethod: {
      type: String,
      enum: ["upi", "card", null],
      default: null,
    },

    customerRatingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rating",
      default: null,
    },
  },
  { timestamps: true }
);

const OrderModel = mongoose.model("Order", orderSchema);
module.exports = { OrderModel };
