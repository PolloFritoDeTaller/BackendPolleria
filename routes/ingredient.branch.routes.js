import { Router } from 'express';
import {
    registerIngredientToBranch,
    getIngredientsByBranch,
    updateIngredientInBranch,
    removeIngredientFromBranch,
    updateIngredientStock
} from '../controllers/ingredient.branch.controller.js';

const ingredientBranchRouter = Router();

ingredientBranchRouter.post('/register', registerIngredientToBranch);
ingredientBranchRouter.get('/getIngredientsByBranch/:nameBranch', getIngredientsByBranch);
ingredientBranchRouter.put('/updateIngredient/:id', updateIngredientInBranch);
ingredientBranchRouter.delete('/removeIngredient', removeIngredientFromBranch);
ingredientBranchRouter.post('/updateStock', updateIngredientStock);

export default ingredientBranchRouter;