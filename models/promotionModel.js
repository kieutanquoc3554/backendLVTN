const mongoose = require("mongoose");

let promoteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  endDate: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  discountValue: {
    type: Number,
    required: true,
  },
  discountType: {
    type: String,
    enum: ["percentage", "fixed"],
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ["zalo", "paypal", "cash", "all"],
    required: true,
    default: "all",
  },
  minOrderValue: {
    type: Number,
    default: 0,
  },
  maxDiscountAmount: {
    type: Number,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

let Promote = mongoose.model("Promotion", promoteSchema);
module.exports = Promote;
