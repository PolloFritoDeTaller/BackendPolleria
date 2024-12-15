import { Ingredient } from '../models/ingredient.model.js';

export const getIngredientsDB = async (req, res) => {
    try {
        const ingredients = await Ingredient.find();
        res.json({
            success: true,
            ingredients
        });
    } catch (error) {
        console.log("Error obteniendo ingredientes: ", error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo ingredientes',
            error: error.message
        });
    }
};

export const getIngredientDB = async (req, res) => {
    const idIngredient = req.params.id;

    try {
        const ingredientFound = await Ingredient.findById(idIngredient);
        if (!ingredientFound) {
            return res.status(404).json({
                success: false,
                message: "Ingrediente no encontrado"
            });
        }

        res.json({
            success: true,
            ingredient: ingredientFound
        });
    } catch (error) {
        console.error("Error al obtener el ingrediente: ", error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el ingrediente',
            error: error.message
        });
    }
};

export const registerIngredient = async (req, res) => {
    const {
        name,
        unit,
        currentStock,
        cost
    } = req.body;

    try {
        const newIngredient = new Ingredient({
            name,
            unit,
            currentStock: parseFloat(currentStock),
            cost: parseFloat(cost)
        });

        const savedIngredient = await newIngredient.save();
        res.status(201).json({
            success: true,
            message: 'Ingrediente registrado exitosamente',
            ingredient: savedIngredient
        });
    } catch (error) {
        console.error("Error al registrar el ingrediente: ", error);
        res.status(500).json({
            success: false,
            message: 'Error al registrar el ingrediente',
            error: error.message
        });
    }
};
