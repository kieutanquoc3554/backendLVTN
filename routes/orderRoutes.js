const express = require("express");
const {
  addOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  reOrder,
  getOrdersByPeriod,
  getOrder,
  updateOrderStatus,
  getNewOrdersCount,
  getNoti,
} = require("../controllers/orderController");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

router.get("/get", getOrder);
router.post("/add", protect, addOrder);
router.get("/my-orders", protect, getUserOrders);
router.get("/get/:id", getOrderById);
router.post("/cancel/:id", protect, cancelOrder);
router.put("/reorder/:id", reOrder);
router.get("/by-date/:date/:period", getOrdersByPeriod);
router.put("/update/:id", updateOrderStatus);
router.get("/new-orders-count", getNewOrdersCount);
router.get("/notifications", getNoti);

module.exports = router;
