const mongoose = require("mongoose");
const moment = require("moment");
const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  order_date: {
    type: Date,
    required: true,
    default: () => new Date(),
  },
  address: {
    type: String,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment",
    required: true,
  },
  discount: {
    type: Number,
    required: true,
    default: 0,
  },
  shipping_fee: {
    type: Number,
    required: true,
    default: 0,
  },
  status: {
    type: String,
    default: "pending",
  },
  orders: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      weight: {
        type: Number,
        required: true,
      },
      unit: {
        type: String,
        ref: "Unit",
        required: true,
      },
      discount: {
        type: Number,
        required: true,
        default: 0,
      },
      status: {
        type: String,
        required: true,
        default: "pending",
      },
    },
  ],
  promotionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Promotion",
    default: null,
  },
  created_at: {
    type: Date,
    required: true,
    default: () => moment().toDate(),
  },
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
