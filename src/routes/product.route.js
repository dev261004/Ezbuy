import { Router } from "express";
import { getAllProducts,getProductById,createProduct,deleteProductById,updateProductById } from "../controllers/product.controller.js";
const router = Router();

router.route("/").get(getAllProducts);

router.route("/:id").get(getProductById);

router.route("/create").post(createProduct);

router.route("/:id").delete(deleteProductById);

router.route("/:id").put(updateProductById);

export default router
