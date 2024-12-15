// controllers/ingredient.branch.controller.js
import { Ingredient } from '../models/ingredient.model.js';
import { DailyInventory } from '../models/inventory.model.js';
import Branch from '../models/branch.model.js';

export const registerIngredientToBranch = async (req, res) => {
    try {
        const { 
            nameBranch,
            name,
            unit,
            currentStock,
            cost
        } = req.body;

        // Verificar campos obligatorios
        if (!nameBranch || !name || !unit || currentStock === undefined || !cost) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos obligatorios (nameBranch, name, unit, currentStock, cost)'
            });
        }

        // Buscar la sucursal
        const branch = await Branch.findOne({ nameBranch: nameBranch.toLowerCase() });
        if (!branch) {
            return res.status(404).json({
                success: false,
                message: 'Sucursal no encontrada'
            });
        }

        // Validar que la unidad sea una de las permitidas
        const validUnits = ['kg', 'g', 'l', 'ml', 'unidad'];
        if (!validUnits.includes(unit)) {
            return res.status(400).json({
                success: false,
                message: 'Unidad de medida no válida'
            });
        }

        // Crear nuevo ingrediente
        const newIngredient = new Ingredient({
            name,
            unit,
            currentStock: parseFloat(currentStock),
            cost: parseFloat(cost)
        });

        // Guardar el ingrediente
        const savedIngredient = await newIngredient.save();

        // Agregar el ingrediente a la sucursal
        branch.ingredients.push(savedIngredient._id);
        await branch.save();

        res.status(201).json({
            success: true,
            message: `Ingrediente registrado exitosamente en la sucursal ${branch.nameBranch}`,
            ingredient: savedIngredient
        });
    } catch (error) {
        console.error("Error al registrar ingrediente en la sucursal:", error);
        res.status(500).json({
            success: false,
            message: 'Error al registrar ingrediente en la sucursal',
            error: error.message
        });
    }
};

export const getIngredientsByBranch = async (req, res) => {
    try {
        const { nameBranch } = req.params;

        const branch = await Branch.findOne({ nameBranch: nameBranch.toLowerCase() })
            .populate('ingredients');

        if (!branch) {
            return res.status(404).json({
                success: false,
                message: 'Sucursal no encontrada'
            });
        }

        res.json({
            success: true,
            message: `Ingredientes obtenidos exitosamente de la sucursal ${branch.nameBranch}`,
            ingredients: branch.ingredients
        });
    } catch (error) {
        console.error("Error al obtener ingredientes de la sucursal:", error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los ingredientes de la sucursal',
            error: error.message
        });
    }
};

export const updateIngredientInBranch = async (req, res) => {
    try {
        const { id } = req.params;
        const { nameBranch, ...updateData } = req.body;

        // Verificar que se proporcionó el nombre de la sucursal
        if (!nameBranch) {
            return res.status(400).json({
                success: false,
                message: 'El nombre de la sucursal es requerido'
            });
        }

        // Buscar la sucursal
        const branch = await Branch.findOne({ nameBranch: nameBranch.toLowerCase() });
        if (!branch) {
            return res.status(404).json({
                success: false,
                message: 'Sucursal no encontrada'
            });
        }

        // Verificar que el ingrediente pertenece a la sucursal
        if (!branch.ingredients.includes(id)) {
            return res.status(403).json({
                success: false,
                message: 'Este ingrediente no pertenece a la sucursal especificada'
            });
        }

        // Validar unidad si se está actualizando
        if (updateData.unit) {
            const validUnits = ['kg', 'g', 'l', 'ml', 'unidad'];
            if (!validUnits.includes(updateData.unit)) {
                return res.status(400).json({
                    success: false,
                    message: 'Unidad de medida no válida'
                });
            }
        }

        const updatedIngredient = await Ingredient.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedIngredient) {
            return res.status(404).json({
                success: false,
                message: 'Ingrediente no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Ingrediente actualizado exitosamente',
            ingredient: updatedIngredient
        });
    } catch (error) {
        console.error("Error al actualizar el ingrediente:", error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el ingrediente',
            error: error.message
        });
    }
};

export const removeIngredientFromBranch = async (req, res) => {
    try {
        const { nameBranch, ingredientId } = req.body;

        // Buscar la sucursal
        const branch = await Branch.findOne({ nameBranch: nameBranch.toLowerCase() });
        if (!branch) {
            return res.status(404).json({
                success: false,
                message: 'Sucursal no encontrada'
            });
        }

        // Verificar si el ingrediente está en la sucursal
        if (!branch.ingredients.includes(ingredientId)) {
            return res.status(404).json({
                success: false,
                message: 'El ingrediente no está asociado a esta sucursal'
            });
        }

        // Eliminar el ingrediente de la sucursal y la base de datos
        await Ingredient.findByIdAndDelete(ingredientId);
        branch.ingredients = branch.ingredients.filter(id => id.toString() !== ingredientId);
        await branch.save();

        res.json({
            success: true,
            message: 'Ingrediente eliminado exitosamente',
            branch: await Branch.findOne({ nameBranch: nameBranch.toLowerCase() })
                .populate('ingredients')
        });
    } catch (error) {
        console.error("Error al eliminar el ingrediente:", error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el ingrediente',
            error: error.message
        });
    }
};

export const updateIngredientStock = async (req, res) => {
    try {
        const { nameBranch, ingredientId, quantity, observations } = req.body;

        if (!nameBranch || !ingredientId || !quantity) {
            return res.status(400).json({
                success: false,
                message: 'Faltan datos requeridos (nameBranch, ingredientId, quantity)'
            });
        }

        // Verificar sucursal
        const branch = await Branch.findOne({ nameBranch: nameBranch.toLowerCase() });
        if (!branch) {
            return res.status(404).json({
                success: false,
                message: 'Sucursal no encontrada'
            });
        }

        // Verificar que el ingrediente existe y pertenece a la sucursal
        const ingredient = await Ingredient.findById(ingredientId);
        if (!ingredient || !branch.ingredients.includes(ingredientId)) {
            return res.status(404).json({
                success: false,
                message: 'Ingrediente no encontrado en esta sucursal'
            });
        }

        // Obtener el inventario activo del día
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const dailyInventory = await DailyInventory.findOne({
            _id: { $in: branch.inventories },
            date: {
                $gte: today,
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            },
            status: 'open'
        });

        if (!dailyInventory) {
            return res.status(400).json({
                success: false,
                message: 'No hay un inventario abierto para el día de hoy'
            });
        }

        // Actualizar el stock del ingrediente
        const newStock = ingredient.currentStock + quantity;
        if (newStock < 0) {
            return res.status(400).json({
                success: false,
                message: `No se puede reducir más allá de 0. Stock actual: ${ingredient.currentStock}`
            });
        }

        // Actualizar el ingrediente
        const updatedIngredient = await Ingredient.findByIdAndUpdate(
            ingredientId,
            { currentStock: newStock },
            { new: true }
        );

        // Registrar el movimiento en el inventario
        const ingredientRecord = dailyInventory.ingredients.find(
            i => i.ingredientId.toString() === ingredientId
        );

        if (!ingredientRecord) {
            return res.status(400).json({
                success: false,
                message: 'Ingrediente no encontrado en el inventario del día'
            });
        }

        const movement = {
            type: quantity > 0 ? 'purchase' : 'adjustment',
            ingredientId: ingredient._id,
            ingredientName: ingredient.name,
            quantity: quantity,
            unit: ingredient.unit,
            reference: `STK-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            date: new Date()
        };

        ingredientRecord.movements.push(movement);
        ingredientRecord.finalStock = ingredientRecord.initialStock + 
            ingredientRecord.movements.reduce((sum, mov) => sum + mov.quantity, 0);

        await dailyInventory.save();

        res.json({
            success: true,
            message: 'Stock actualizado exitosamente',
            ingredient: updatedIngredient,
            movement: movement
        });

    } catch (error) {
        console.error("Error al actualizar stock:", error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el stock',
            error: error.message
        });
    }
};