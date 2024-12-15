// middlewares/closeInventory.middleware.js
import { DailyInventory } from '../models/inventory.model.js';
import Branch from '../models/branch.model.js';

const validateInventoryClose = async (req, res, next) => {
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
        
        const inventory = await DailyInventory.findOne({
            _id: { $in: branch.inventories },
            date: {
                $gte: today,
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            },
            status: 'open'
        });

        if (!inventory) {
            return res.status(404).json({
                success: false,
                message: 'No hay un inventario abierto para cerrar'
            });
        }

        req.inventory = inventory;
        next();
    } catch (error) {
        next(error);
    }
};

export default validateInventoryClose;