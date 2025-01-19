const mongoose = require("mongoose");

const ImportProductSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  weight: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
});

const ImportReceiptSchema = new mongoose.Schema({
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supplier",
    required: true,
  },
  products: [ImportProductSchema],
  totalAmount: {
    type: Number,
    required: true,
  },
  importDate: {
    type: Date,
    default: Date.now(),
  },
  note: {
    type: String,
  },
});

const ImportReceipt = mongoose.model("ImportReceipt", ImportReceiptSchema);
module.exports = ImportReceipt;
