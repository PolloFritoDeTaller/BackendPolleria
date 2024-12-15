import { Router } from "express";
import { getProductDB, getProductsDB, registerProduct } from "../controllers/products.controller.js";
import upload from "../config/multer.config.js";

const productsRouter = Router();

productsRouter.post('/', upload.single('image') , registerProduct);
productsRouter.get('/', getProductsDB);
productsRouter.get('/:id', getProductDB);

export default productsRouter;