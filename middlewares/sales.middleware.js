import Product from '../models/product.model.js';
import { Ingredient } from '../models/ingredient.model.js';
import { DailyInventory } from '../models/inventory.model.js';
import Branch from '../models/branch.model.js';

async function calculateIngredientUsage(products) {
    let ingredientUsage = {};

    for (const product of products) {
        const productDetails = await Product.findById(product.productId);
        if (!productDetails?.recipe) continue;

        for (const ingredient of productDetails.recipe) {
            const totalUsage = ingredient.amount * product.quantity;
            
            if (!ingredientUsage[ingredient.ingredientId]) {
                ingredientUsage[ingredient.ingredientId] = {
                    ingredientId: ingredient.ingredientId,
                    name: ingredient.name,
                    quantity: totalUsage,
                    unit: ingredient.unit
                };
            } else {
                ingredientUsage[ingredient.ingredientId].quantity += totalUsage;
            }
        }
    }

    return Object.values(ingredientUsage);
}

async function updateIngredientsStock(ingredients) {
    for (const usage of ingredients) {
        const ingredient = await Ingredient.findById(usage.ingredientId);
        
        if (!ingredient) {
            throw new Error(`Ingrediente ${usage.name} no encontrado`);
        }

        const newStock = ingredient.currentStock - usage.quantity;
        
        if (newStock < 0) {
            throw new Error(`Stock insuficiente de ${usage.name}. Stock actual: ${ingredient.currentStock} ${ingredient.unit}`);
        }

        await Ingredient.findByIdAndUpdate(
            usage.ingredientId,
            { currentStock: newStock },
            { new: true }
        );
    }
}

async function registerInventoryMovements(dailyInventory, ingredients, ticketNumber) {
    for (const usage of ingredients) {
        let ingredientRecord = dailyInventory.ingredients.find(
            i => i.ingredientId.toString() === usage.ingredientId.toString()
        );

        if (!ingredientRecord) {
            throw new Error(`Ingrediente ${usage.name} no encontrado en el inventario diario`);
        }

        // Registrar el movimiento
        const movement = {
            type: 'sale',
            ingredientId: usage.ingredientId,
            ingredientName: usage.name,
            quantity: -usage.quantity, // Negativo porque es una venta/salida
            unit: usage.unit,
            reference: ticketNumber,
            date: new Date()
        };

        ingredientRecord.movements.push(movement);
        
        // Actualizar stock final en el inventario
        ingredientRecord.finalStock = ingredientRecord.initialStock + 
            ingredientRecord.movements.reduce((sum, mov) => sum + mov.quantity, 0);
    }

    await dailyInventory.save();
}

export const processSaleIngredients = async function(req, res, next) {
    try {
        const { nameBranch } = req.body;
        
        // Verificar la sucursal
        const branch = await Branch.findOne({ nameBranch: nameBranch.toLowerCase() })
            .populate('inventories');

        if (!branch) {
            return res.status(404).json({
                success: false,
                message: 'Sucursal no encontrada'
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

        // Calcular uso de ingredientes
        const ingredientUsage = await calculateIngredientUsage(req.body.products);
        
        if (ingredientUsage.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No se encontraron ingredientes para los productos especificados'
            });
        }

        // Generar número de ticket para referencia
        const ticketNumber = `TK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Actualizar stock de ingredientes
        await updateIngredientsStock(ingredientUsage);

        // Registrar movimientos en el inventario
        await registerInventoryMovements(dailyInventory, ingredientUsage, ticketNumber);

        // Guardar referencias para el siguiente middleware
        req.ingredientUsage = ingredientUsage;
        req.ticketNumber = ticketNumber;
        
        next();
    } catch (error) {
        console.error("Error en el procesamiento de la venta:", error);
        res.status(400).json({
            success: false,
            message: error.message || 'Error al procesar la venta'
        });
    }
};