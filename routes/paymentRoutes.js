const express = require("express");
const router = express.Router();
const {
  getCID,
  addPaymentMethod,
  getAllMethod,
  getMethodById,
  payment,
  callback,
  orderStatus,
} = require("../controllers/paymentController");

router.get("/config", getCID);
router.post("/add", addPaymentMethod);
router.get("/all", getAllMethod);
router.get("/get/:id", getMethodById);
router.post("/payment", payment);
router.post("/callback", callback);
router.post("/check/:app_trans_id", orderStatus);

module.exports = router;
