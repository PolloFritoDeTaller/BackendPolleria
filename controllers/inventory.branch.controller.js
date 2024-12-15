import Branch from '../models/branch.model.js';
import { DailyInventory } from '../models/inventory.model.js';
import { Ingredient } from '../models/ingredient.model.js';
import mongoose from 'mongoose';

export const addInventoryToBranch = async (req, res) => {
    try {
        const { nameBranch, employees, observations } = req.body;

        // Validaciones básicas
        if (!nameBranch || !employees) {
            return res.status(400).json({
                success: false,
                message: 'Faltan datos requeridos (nameBranch, employees)'
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

        // Verificar si ya existe un inventario para hoy en esta sucursal
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const existingInventory = await DailyInventory.findOne({
            date: {
                $gte: today,
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            },
            _id: { $in: branch.inventories }
        });

        if (existingInventory) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe un inventario para el día de hoy en esta sucursal'
            });
        }

        // Obtener todos los ingredientes de la sucursal
        const branchIngredients = await Ingredient.find({
            _id: { $in: branch.ingredients }
        });

        // Preparar los ingredientes para el inventario
        const inventoryIngredients = branchIngredients.map(ingredient => ({
            ingredientId: ingredient._id,
            name: ingredient.name,
            initialStock: ingredient.currentStock,
            finalStock: ingredient.currentStock, // Inicialmente igual al stock actual
            movements: [] // Inicia sin movimientos
        }));

        // Crear nuevo inventario
        const newInventory = new DailyInventory({
            employees,
            ingredients: inventoryIngredients,
            observations,
            date: new Date() // Aseguramos que se guarde la fecha actual
        });

        const savedInventory = await newInventory.save();

        // Agregar el inventario a la sucursal
        branch.inventories.push(savedInventory._id);
        await branch.save();
        
        res.status(201).json({
            success: true,
            message: `Inventario registrado exitosamente en la sucursal ${branch.nameBranch}`,
            inventory: savedInventory
        });
    } catch (error) {
        console.error("Error al crear el inventario:", error);
        res.status(500).json({
            success: false,
            message: 'Error al crear el inventario',
            error: error.message
        });
    }
};

export const getInventoryById = async (req, res) => {
    try {
        const { nameBranch, id } = req.params;

        // Validar que el ID sea un ObjectId válido
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de inventario inválido'
            });
        }

        // Primero buscar la sucursal
        const branch = await Branch.findOne({ 
            nameBranch: nameBranch.toLowerCase(),
            inventories: id  // Verifica que el inventario pertenezca a esta sucursal
        });

        if (!branch) {
            return res.status(404).json({
                success: false,
                message: 'Sucursal no encontrada o el inventario no pertenece a esta sucursal'
            });
        }

        // Buscar el inventario
        const inventory = await DailyInventory.findById(id);

        if (!inventory) {
            return res.status(404).json({
                success: false,
                message: 'Inventario no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Inventario obtenido exitosamente',
            inventory,
            branch: {
                id: branch._id,
                name: branch.nameBranch
            }
        });
    } catch (error) {
        console.error("Error al obtener el inventario:", error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el inventario',
            error: error.message
        });
    }
};

// Obtener inventarios por sucursal
export const getDailyInventoryByBranch = async (req, res) => {
    try {
        const { nameBranch } = req.params;
        
        const branch = await Branch.findOne({ nameBranch: nameBranch.toLowerCase() })
            .populate('inventories');

        if (!branch) {
            return res.status(404).json({ 
                success: false, 
                message: 'Sucursal no encontrada' 
            });
        }

        res.json({
            success: true,
            inventories: branch.inventories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener los inventarios',
            error: error.message
        });
    }
};


export const getCurrentDayInventoryByBranch = async (req, res) => {
    try {
        const { nameBranch } = req.params;

        const branch = await Branch.findOne({ nameBranch: nameBranch.toLowerCase() });
        if (!branch) {
            return res.status(404).json({ 
                success: false, 
                message: 'Sucursal no encontrada' 
            });
        }

        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(startOfDay);
        endOfDay.setDate(startOfDay.getDate() + 1);
        
        const currentInventory = await DailyInventory.findOne({
            date: {
                $gte: startOfDay,
                $lt: endOfDay
            },
            _id: { $in: branch.inventories }
        });

        if (!currentInventory) {
            return res.status(404).json({
                success: false,
                message: 'No se ha registrado inventario para hoy en esta sucursal'
            });
        }

        res.json({
            success: true,
            message: 'Inventario del día obtenido exitosamente',
            inventory: currentInventory
        });
    } catch (error) {
        console.error("Error al obtener el inventario del día: ", error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el inventario del día',
            error: error.message
        });
    }
};

// Obtener inventario por fecha y sucursal
export const getInventoryByDateAndBranch = async (req, res) => {
    try {
        const { date, nameBranch } = req.params;
        
        const branch = await Branch.findOne({ nameBranch: nameBranch.toLowerCase() });
        if (!branch) {
            return res.status(404).json({ 
                success: false, 
                message: 'Sucursal no encontrada' 
            });
        }

        // Convierte la fecha a un objeto Date
        const startDate = new Date(date);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 1); // Para incluir todas las ventas del día

        const inventory = await DailyInventory.findOne({
            date: {
                $gte: startDate,
                $lt: endDate
            },
            _id: { $in: branch.inventories }
        });

        if (!inventory) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró inventario para la fecha especificada en esta sucursal'
            });
        }

        res.json({
            success: true,
            message: 'Inventario obtenido por fecha exitosamente',
            inventory
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el inventario',
            error: error.message
        });
    }
};

// Actualizar inventario de sucursal
export const updateBranchInventory = async (req, res) => {
    try {
        const { id } = req.params;
        const { nameBranch, ...updateData } = req.body;

        if (!nameBranch) {
            return res.status(400).json({
                success: false,
                message: 'El nombre de la sucursal es requerido'
            });
        }

        const branch = await Branch.findOne({ nameBranch: nameBranch.toLowerCase() });
        if (!branch) {
            return res.status(404).json({ 
                success: false, 
                message: 'Sucursal no encontrada' 
            });
        }

        // Verificar que el inventario pertenezca a la sucursal
        if (!branch.inventories.includes(id)) {
            return res.status(403).json({
                success: false,
                message: 'Este inventario no pertenece a la sucursal especificada'
            });
        }

        const updatedInventory = await DailyInventory.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedInventory) {
            return res.status(404).json({
                success: false,
                message: 'Inventario no encontrado'
            });
        }

        res.json({
            success: true,
            inventory: updatedInventory
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el inventario',
            error: error.message
        });
    }
};

// Obtener estadísticas de inventario por sucursal
export const getInventoryStatsByBranch = async (req, res) => {
    try {
        const { nameBranch } = req.params;

        const branch = await Branch.findOne({ nameBranch: nameBranch.toLowerCase() });
        if (!branch) {
            return res.status(404).json({ 
                success: false, 
                message: 'Sucursal no encontrada' 
            });
        }

        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);

        const stats = await DailyInventory.aggregate([
            {
                $match: {
                    _id: { $in: branch.inventories },
                    date: { $gte: lastWeek }
                }
            },
            {
                $unwind: '$inventoryItems'
            },
            {
                $group: {
                    _id: '$inventoryItems.category',
                    avgInitialStock: { $avg: '$inventoryItems.details.initialStock' },
                    avgFinalStock: { $avg: '$inventoryItems.details.finalStock' },
                    totalSales: { $sum: '$inventoryItems.details.sales' },
                    daysTracked: { $sum: 1 }
                }
            }
        ]);

        res.json({
            success: true,
            stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener las estadísticas',
            error: error.message
        });
    }
};

export const closeInventory = async (req, res) => {
    try {
        const { inventory } = req;

        // El middleware ya validó la existencia del inventario
        inventory.status = 'closed';
        
        // Calculamos el stock final para cada ingrediente
        inventory.ingredients.forEach(ingredient => {
            ingredient.finalStock = ingredient.initialStock + 
                ingredient.movements.reduce((sum, mov) => sum + mov.quantity, 0);
        });

        const updatedInventory = await inventory.save();

        res.json({
            success: true,
            message: 'Inventario cerrado exitosamente',
            inventory: updatedInventory
        });
    } catch (error) {
        console.error("Error al cerrar el inventario:", error);
        res.status(500).json({
            success: false,
            message: 'Error al cerrar el inventario',
            error: error.message
        });
    }
};