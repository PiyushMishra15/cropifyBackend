const express = require("express");
const router = express.Router();

const orderController = require("../controllers/orderController");
const verifyToken = require("../controllers/auth").verifyToken;

// Route to place a new order (requires user authentication)
router.post("/add", verifyToken, orderController.addOrder);

// Route to get seller's orders (requires seller authentication)
router.get("/sellerOrders", verifyToken, orderController.showOrdersBySeller);

module.exports = router;
