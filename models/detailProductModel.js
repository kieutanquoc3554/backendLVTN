const mongoose = require("mongoose");

const priceHistorySchema = new mongoose.Schema({
  oldPrice: Number,
  oldDiscount: Number,
  oldWeight: Number,
  oldUnit: { type: mongoose.Schema.Types.ObjectId, ref: "Unit" },
  updatedAt: Date,
  newPrice: Number,
  newDiscount: Number,
  newWeight: Number,
  newUnit: { type: mongoose.Schema.Types.ObjectId, ref: "Unit" },
});

const ProductDetailSchema = new mongoose.Schema({
  weight: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    default: 0,
    required: true,
  },
  unit: {
    ref: "Unit",
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  initPrice: {
    type: Number,
  },
  discount: {
    type: Number,
    required: true,
    default: 0,
  },
  finalPrice: {
    type: Number,
  },
  soldQuantity: {
    type: Number,
    default: 0,
  },
  revenue: {
    type: Number,
    default: 0,
  },
  inventoryCount: {
    type: Number,
    default: function () {
      return this.quantity - this.soldQuantity;
    },
  },
  priceHistory: [priceHistorySchema],
});

module.exports = ProductDetailSchema;
