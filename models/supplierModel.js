const mongoose = require("mongoose");

let supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  fax: {
    type: String,
  },
});

const Supplier = mongoose.model("Supplier", supplierSchema);
module.exports = Supplier;
