import express from "express";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from "../controllers/productController.js";
import verifyFirebaseToken from "../middleware/verifyFirebaseToken.js";
import rolemiddleware from "../middleware/rolemiddleware.js";

const router = express.Router();

router.get("/", getProducts);

router.post(
  "/",
  verifyFirebaseToken,
  rolemiddleware("admin", "super_admin"),
  createProduct
);

router.put(
  "/:id",
  verifyFirebaseToken,
  rolemiddleware("admin", "super_admin"),
  updateProduct
);

router.delete(
  "/:id",
  verifyFirebaseToken,
  rolemiddleware("admin", "super_admin"),
  deleteProduct
);

export default router;
