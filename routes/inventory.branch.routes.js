import { Router } from 'express';
import { 
    addInventoryToBranch,
    getDailyInventoryByBranch,
    getCurrentDayInventoryByBranch,
    getInventoryByDateAndBranch,
    updateBranchInventory,
    getInventoryStatsByBranch,
    getInventoryById,
    closeInventory
} from '../controllers/inventory.branch.controller.js';
import validateDailyInventory from '../middlewares/inventory.middleware.js';
import validateInventoryClose from '../middlewares/closeInventory.middleware.js';

const inventoryBranchRouter = Router();

// POST - Gestión de inventario
inventoryBranchRouter.post('/addInventory', validateDailyInventory, addInventoryToBranch);
inventoryBranchRouter.post('/closeInventory', validateInventoryClose, closeInventory);

// GET - Consultas de inventario
inventoryBranchRouter.get('/branch/:nameBranch', getDailyInventoryByBranch);
inventoryBranchRouter.get('/current/:nameBranch', getCurrentDayInventoryByBranch);
inventoryBranchRouter.get('/date/:nameBranch/:date', getInventoryByDateAndBranch);
inventoryBranchRouter.get('/stats/:nameBranch', getInventoryStatsByBranch);
inventoryBranchRouter.get('/branch/:nameBranch/:id', getInventoryById);
// PUT - Actualización de inventario
inventoryBranchRouter.put('/update/:id', updateBranchInventory);

export default inventoryBranchRouter;