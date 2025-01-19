const express = require("express");
const {
  addPromote,
  applyPromote,
  getAllPromotions,
  getPromotionById,
  updatePromotion,
  deletePromotion,
  revertPromotion,
  getApplicablePromotions,
} = require("../controllers/promoteController");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

router.post("/add", addPromote);
router.post("/apply", protect, applyPromote);
router.get("/getPromotions", getAllPromotions);
router.get("/:id", getPromotionById);
router.put("/:id", updatePromotion);
router.delete("/:id", deletePromotion);
router.post("/reset/:code", protect, revertPromotion);
router.post("/applicable", protect, getApplicablePromotions);

module.exports = router;
