import express from 'express';
import {
    registerEmployeeToBranch,
    getEmployeesByBranch,
    getEmployeeById,
    getEmployeesWithFilters,
    editEmployeeInBranch,
    deleteEmployeeFromBranch
} from '../controllers/employees.branch.controller.js';

const employeeBranchRouter = express.Router();

// Ruta para registrar un empleado en una sucursal
employeeBranchRouter.post('/addEmployee', registerEmployeeToBranch);

// Ruta para obtener empleados en una sucursal específica
employeeBranchRouter.get('/getEmployeesByBranch/:branchName', getEmployeesByBranch);

// Ruta para obtener un empleado por ID
employeeBranchRouter.get('/getEmployeeById/:id', getEmployeeById);

// Ruta para obtener empleados con filtros
employeeBranchRouter.get('/getEmployeesWithFilters', getEmployeesWithFilters);

// Ruta para editar un empleado
employeeBranchRouter.put('/editEmployee/:id', editEmployeeInBranch);

// Ruta para eliminar un empleado
employeeBranchRouter.delete('/deleteEmployee/:id', deleteEmployeeFromBranch);

export default employeeBranchRouter;