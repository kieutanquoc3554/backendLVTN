const express = require("express");
const {
  addSupplier,
  getSupplierByID,
  updateSupplierByID,
  deleteSupplier,
  getSupplier,
} = require("../controllers/supplierController");
const router = express.Router();

router.post("/add", addSupplier);
router.get("/getAll", getSupplier);
router.get("/get/:id", getSupplierByID);
router.put("/update/:id", updateSupplierByID);
router.delete("/delete/:id", deleteSupplier);

module.exports = router;
