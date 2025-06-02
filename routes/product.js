const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { verifyToken } = require("../controllers/auth");

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
  "/add",
  verifyToken,
  upload.single("image"),
  productController.addProduct
);

router.put(
  "/update/:productId",
  verifyToken,
  upload.single("image"),
  productController.updateProduct
);

router.delete(
  "/delete/:productId",
  verifyToken,
  productController.deleteProduct
);

router.get(
  "/category/:category/",
  verifyToken,
  productController.getProductDataByCategory
);

router.get(
  "/dashboard/:productId",
  verifyToken,
  productController.getProductDashboardData
);

router.get(
  "/sellerProduct",
  verifyToken,
  productController.getSellerDashboardProducts
);

router.get("/:productId", verifyToken, productController.getProductById);

router.get(
  "/stock/:productId",
  verifyToken,
  productController.getProductStocksById
);

router.get(
  "/main/:productId",
  verifyToken,
  productController.getMainProductDataById
);

module.exports = router;
