const express = require("express");
const { addUnit, getUnit } = require("../controllers/unitController");
const router = express.Router();

router.post("/add", addUnit);
router.get("/getAll", getUnit);

module.exports = router;
