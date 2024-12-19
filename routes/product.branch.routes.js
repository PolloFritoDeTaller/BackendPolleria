import { Router } from "express";
import { addProductToBranch, getProductsByBranch, editProductInBranch, deleteProductFromBranch, updateProductRecipe } from "../controllers/products.branch.controller.js";

const productsBranchRouter = Router();

productsBranchRouter.post('/addProduct', addProductToBranch);
productsBranchRouter.post('/getProducts', getProductsByBranch);
productsBranchRouter.put('/editProduct/:id', editProductInBranch); // Ruta para editar producto
productsBranchRouter.delete('/deleteProduct/:id', deleteProductFromBranch); // Ruta para eliminar producto
productsBranchRouter.put('/updateRecipe/:productId', updateProductRecipe);

export default productsBranchRouter;
