const mongoose = require("mongoose");

const CategoryProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  coverImages: [
    {
      type: String,
      required: false,
    },
  ],
});

const Category = mongoose.model("Category", CategoryProductSchema);
module.exports = Category;
