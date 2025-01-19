const express = require("express");
const router = express.Router();
const {
  createImportReceipt,
  getAllImportReceipts,
  getImportReceiptById,
  deleteImportReceipt,
} = require("../controllers/importController");

router.post("/importReceipts", createImportReceipt);
router.get("/allImportReceipts", getAllImportReceipts);
router.get("/getImports/:id", getImportReceiptById);
router.delete("/delete/:id", deleteImportReceipt);

module.exports = router;
