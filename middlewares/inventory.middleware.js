// middlewares/inventory.middleware.js
import { DailyInventory } from '../models/inventory.model.js';
import Branch from '../models/branch.model.js';

const validateDailyInventory = async (req, res, next) => {
    try {
        const { nameBranch } = req.body;
        
        const branch = await Branch.findOne({ nameBranch: nameBranch.toLowerCase() });
        if (!branch) {
            return res.status(404).json({
                success: false,
                message: 'Sucursal no encontrada'
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const existingInventory = await DailyInventory.findOne({
            _id: { $in: branch.inventories },
            date: {
                $gte: today,
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            },
            status: 'open'
        });

        if (existingInventory) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe un inventario abierto para el día de hoy'
            });
        }

        req.branch = branch;
        next();
    } catch (error) {
        next(error);
    }
};

export default validateDailyInventory;