const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const connectDatabase = require("./config/db");
const uploadRoutes = require("./routes/uploadRoutes");
const productRoutes = require("./routes/productRoutes");
const unitRoutes = require("./routes/unitRoutes");
const userRoutes = require("./routes/userRoutes");
const cartRoutes = require("./routes/cartRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const orderRoutes = require("./routes/orderRoutes");
const statisticRoutes = require("./routes/statisticRoutes");
const promoteRoutes = require("./routes/promoteRoutes");
const articleRoutes = require("./routes/articleRoutes");
const importRoutes = require("./routes/importRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

dotenv.config();

app.use(express.json());
app.use(cors());
const port = process.env.PORT || 5000;
const bodyParser = require("body-parser");
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

connectDatabase();

app.use("/upload", uploadRoutes);
app.use("/products", productRoutes);
app.use("/units", unitRoutes);
app.use("/users", userRoutes);
app.use("/carts", cartRoutes);
app.use("/payments", paymentRoutes);
app.use("/orders", orderRoutes);
app.use("/statistic", statisticRoutes);
app.use("/promotions", promoteRoutes);
app.use("/articles", articleRoutes);
app.use("/imports", importRoutes);
app.use("/suppliers", supplierRoutes);
app.use("/reviews", reviewRoutes);

app.listen(port, (error) => {
  if (!error) {
    console.log("Server's running on port " + port);
  } else {
    console.log("Error");
  }
});

app.get("/", (req, res) => {
  res.send("TEST");
});
