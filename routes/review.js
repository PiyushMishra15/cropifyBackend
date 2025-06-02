const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const { verifyToken } = require("../controllers/auth");

// Add Review
router.use(verifyToken);
router.post("/:productId", reviewController.addReview);

router.get("/:productId", reviewController.getPaginatedReview);

module.exports = router;
