import { Router } from "express";
import upload from "../config/multer.config.js";
import { registerEmployee, getEmployees, getEmployeeByCi } from "../controllers/employees.controller.js";

const employeesRouter = Router();

employeesRouter.post('/', upload.single('photo'), registerEmployee);
employeesRouter.get('/', getEmployees);
employeesRouter.get('/:ci', getEmployeeByCi);

export default employeesRouter;