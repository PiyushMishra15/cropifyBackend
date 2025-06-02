const express = require("express");
const router = express.Router();
const graphController = require("../controllers/graphController");
const { verifyToken } = require("../controllers/auth");

// Get Graph Data
router.get("/", verifyToken, graphController.getGraphData);

module.exports = router;
