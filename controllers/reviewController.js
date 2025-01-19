const Review = require("../models/reviewModel");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");

const addReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user.userId;
    if (rating === 0) {
      return res.status(400).json({ message: "Vui lòng thêm số sao đánh giá" });
    }
    if (!comment) {
      return res
        .status(400)
        .json({ message: "Vui lòng thêm nội dung đánh giá" });
    }
    const newReview = await Review.create({
      productId,
      userId,
      rating,
      comment,
    });
    res.status(200).json(newReview);
  } catch (error) {
    res.status(500).json({ message: "Failed to create review", error });
  }
};

const getReview = async (req, res) => {
  try {
    const { productId } = req.query;
    const reviews = await Review.find({ productId })
      .populate("replies.userId")
      .populate("userId")
      .lean();

    const ordersWithProduct = await Order.find({
      "orders.productId": productId,
    });
    const purchasedUsers = new Set();
    ordersWithProduct.forEach((order) => {
      order.orders.forEach((item) => {
        if (item.productId.toString() === productId) {
          purchasedUsers.add(order.userId.toString());
        }
      });
    });
    const updatedReviews = reviews.map((review) => ({
      ...review,
      hasPurchased: purchasedUsers.has(review.userId._id.toString()),
    }));
    res.status(200).json(updatedReviews);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reviews", error });
  }
};

const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const updatedReview = await Review.findByIdAndUpdate(
      id,
      {
        rating,
        comment,
      },
      { new: true }
    );
    res.status(200).json(updatedReview);
  } catch (error) {
    res.status(500).json({ message: "Failed to update review", error });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    await Review.findByIdAndDelete(id);
    res.status(200).json({ message: "Đã xoá đánh giá!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi", error });
  }
};

const getReviewByID = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id).populate("userId", "name");
    if (!review) {
      return res.status(404).json({ message: "Không tìm thấy đánh giá" });
    }
    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch review", error });
  }
};

const addReply = async (req, res) => {
  try {
    const { reviewId, comment, userId } = req.body;
    const newReply = { userId, comment };
    const review = await Review.findByIdAndUpdate(
      reviewId,
      { $push: { replies: newReply } },
      { new: true }
    ).populate("replies.userId", "name");
    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ message: "Failed to add reply", error });
  }
};

const getReviewStats = async (req, res) => {
  try {
    const { productId } = req.query;
    const reviews = await Review.find({ productId });
    const totalReviews = reviews.length;
    console.log(reviews);
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0;
    res.status(200).json({
      totalReviews,
      averageRating: averageRating.toFixed(2),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to calculate review stats", error });
  }
};

const getAllProductsWithReviewCount = async (req, res) => {
  try {
    const products = await Product.find();
    const productsWithReviewCount = await Promise.all(
      products.map(async (product) => {
        const reviewCount = await Review.countDocuments({
          productId: product._id,
        });
        return {
          ...product.toObject(),
          reviewCount,
        };
      })
    );
    res.status(200).json(productsWithReviewCount);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch products with review count", error });
  }
};
module.exports = {
  addReview,
  getReview,
  updateReview,
  deleteReview,
  getReviewByID,
  addReply,
  getReviewStats,
  getAllProductsWithReviewCount,
};
