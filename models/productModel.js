const mongoose = require("mongoose");
const ProductDetailSchema = require("./detailProductModel");
const ImageSchema = require("./imageSchema");

const productSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  rating: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  details: [ProductDetailSchema],
  images: [ImageSchema],
  videos: [
    {
      url: { type: String, required: true },
      description: { type: String },
    },
  ],
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
