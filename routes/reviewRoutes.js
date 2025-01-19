const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  addReview,
  getReview,
  updateReview,
  deleteReview,
  getReviewByID,
  addReply,
  getReviewStats,
  getAllProductsWithReviewCount,
} = require("../controllers/reviewController");

router.post("/addReview", protect, addReview);
router.get("/getReview", protect, getReview);
router.put("/updateReview", protect, updateReview);
router.delete("/deleteReview/:id", protect, deleteReview);
router.get("/getReviewByID/:id", protect, getReviewByID);
router.post("/addReply", protect, addReply);
router.get("/stats", protect, getReviewStats);
router.get("/products-with-review-count", getAllProductsWithReviewCount);

module.exports = router;
