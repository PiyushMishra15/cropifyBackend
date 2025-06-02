const express = require("express");
const router = express.Router();
const { predictCrops } = require("../controllers/aiController"); // Adjust path as needed
const { verifyToken } = require("../controllers/auth");

// Route for crop prediction, e.g.:
// GET /api/crops/predict?soil=clay&altitude=1000&temperature=30&humidity=80&rainfall=120
router.get("/predict", verifyToken, predictCrops);

module.exports = router;
