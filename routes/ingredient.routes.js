import { Router } from 'express';
import {
    getIngredientsDB,
    getIngredientDB,
    registerIngredient
} from '../controllers/ingredient.controller.js';

const ingredientRouter = Router();

ingredientRouter.get('/getIngredients', getIngredientsDB);
ingredientRouter.get('/getIngredient/:id', getIngredientDB);
ingredientRouter.post('/register', registerIngredient);

export default ingredientRouter;