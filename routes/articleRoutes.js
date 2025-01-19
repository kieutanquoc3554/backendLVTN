const express = require("express");
const router = express.Router();
const articleController = require("../controllers/articleController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, articleController.createArticle);
router.get("/", articleController.getAllArticles);
router.get("/:id", articleController.getArticleById);
router.put("/:id", articleController.updateArticle);
router.delete("/:id", articleController.deleteArticle);

module.exports = router;
