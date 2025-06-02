const express = require("express");
const router = express.Router();
const {
  addFAQ,
  showFAQsbyProduct,
  showFAQsbySeller,
  ansFAQ,
} = require("../controllers/faqsController");

const { verifyToken } = require("../controllers/auth");

router.post("/:productId", verifyToken, addFAQ);

router.put("/:faqId/answer", verifyToken, ansFAQ);

router.get("/show/:productId/", verifyToken, showFAQsbyProduct);

router.get("/seller", verifyToken, showFAQsbySeller);

module.exports = router;
