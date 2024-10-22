const express = require("express");
const router = express.Router();
const productController = require("../contollers/productController");
const TokenVerificationMiddleware = require("../middleware/authMiddleware");

router.get(
  "/products",
  TokenVerificationMiddleware,
  productController.GetProducts
);
router.post(
  "/products",
  TokenVerificationMiddleware,
  productController.AddProduct
);
router.put(
  "/products/edit/:id",
  TokenVerificationMiddleware,
  productController.EditProduct
);
router.delete(
  "/products/:id",
  TokenVerificationMiddleware,
  productController.DeleteProduct
);

module.exports = router;
