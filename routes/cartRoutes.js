const express = require("express");
const { updateCart, getCart } = require("../controllers/cartController");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

router.post("/updateCart", protect, updateCart);
router.get("/getCart", protect, getCart);

module.exports = router;
