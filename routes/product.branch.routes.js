import { Router } from "express";
import upload from "../config/multer.config.js";
import { addProductToBranch, getProductsByBranch, editProductInBranch, deleteProductFromBranch, updateProductRecipe } from "../controllers/products.branch.controller.js";

const productsBranchRouter = Router();

productsBranchRouter.post('/addProduct', upload.single('image'), addProductToBranch);
productsBranchRouter.post('/getProducts', getProductsByBranch);
productsBranchRouter.put('/editProduct/:id', upload.single('image'), editProductInBranch); // Ruta para editar producto
productsBranchRouter.delete('/deleteProduct/:id', deleteProductFromBranch); // Ruta para eliminar producto
productsBranchRouter.put('/updateRecipe/:productId', updateProductRecipe);

export default productsBranchRouter;
