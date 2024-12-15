// controllers/employees.branch.controller.js
import Employee from '../models/employees.model.js';
import Branch from '../models/branch.model.js';
import bcrypt from 'bcrypt';


// Registrar un nuevo empleado en una sucursal
export const registerEmployeeToBranch = async (req, res) => {
    const { branchName, name, ci, phone, email, password, contractStart, contractEnd, salary, role } = req.body;
    const photo = req.file ? req.file.path : null;
    
    if (!req.file) {
        console.error("Error: No se subió ninguna imagen.");
    } else {
        console.log("Imagen subida exitosamente:", req.file.filename);
    }
    
    // Verificar que la contraseña no esté vacía
    if (!password) {
        return res.status(400).json({ success: false, message: 'La contraseña es obligatoria.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const branch = await Branch.findOne({ nameBranch: branchName.toLowerCase() });
        if (!branch) {
            return res.status(404).json({ success: false, message: 'Sucursal no encontrada' });
        }

        const newEmployee = new Employee({
            name,
            ci,
            phone,
            email,
            password: hashedPassword,
            contractStart,
            contractEnd,
            salary,
            role,
            photo: req.file ? req.file.filename : null,
        });

        const savedEmployee = await newEmployee.save();
        console.log(newEmployee);
        branch.employees.push(savedEmployee._id);
        await branch.save();

        res.status(200).json({
            success: true,
            message: `Empleado registrado exitosamente en la sucursal ${branch.nameBranch}`,
            employee: savedEmployee,
        });
    } catch (error) {
        console.error("Error al registrar empleado en la sucursal:", error);
        res.status(500).json({
            success: false,
            message: 'Error al registrar empleado en la sucursal',
            error: error.message,
        });
    }
};

// Obtener empleados en una sucursal específica
export const getEmployeesByBranch = async (req, res) => {
    const { branchName } = req.params;

    try {
        const branch = await Branch.findOne({ nameBranch: branchName.toLowerCase() }).populate('employees');
        if (!branch) {
            return res.status(404).json({ success: false, message: 'Sucursal no encontrada' });
        }

        res.status(200).json({
            success: true,
            message: `Empleados obtenidos exitosamente en la sucursal ${branch.nameBranch}`,
            employees: branch.employees,
        });
    } catch (error) {
        console.error("Error al obtener empleados por sucursal:", error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener empleados de la sucursal',
            error: error.message,
        });
    }
};

// Obtener empleado por ID
export const getEmployeeById = async (req, res) => {
    const { id } = req.params;

    try {
        const employee = await Employee.findById(id);
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
        }

        res.status(200).json({
            success: true,
            employee,
        });
    } catch (error) {
        console.error("Error al obtener empleado por ID:", error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener empleado por ID',
            error: error.message,
        });
    }
};

// Obtener empleados con filtros
export const getEmployeesWithFilters = async (req, res) => {
    const { branchName, contractStatus, role } = req.query;
    const salaryMin = req.query['salaryRange[min]'];
    const salaryMax = req.query['salaryRange[max]'];
    const today = new Date();

    const filterConditions = {};
    // Filtro por sucursal
    if (branchName) {
        const branch = await Branch.findOne({ nameBranch: branchName.toLowerCase() });
        if (branch) {
            filterConditions._id = { $in: branch.employees }; // Filtra por IDs de empleados en esa sucursal
        } else {
            return res.status(404).json({ success: false, message: 'Sucursal no encontrada' });
        }
    }

    // Filtro por salario
    if (salaryMin || salaryMax) {
        filterConditions.salary = {};
        if (salaryMin) filterConditions.salary.$gte = Number(salaryMin);
        if (salaryMax) filterConditions.salary.$lte = Number(salaryMax);
    }

    // Filtro por estado de contrato
    if (contractStatus && contractStatus !== 'all') {
        filterConditions.contractEnd = contractStatus === 'active'
            ? { $gte: today }
            : { $lt: today };
    }

    // Filtro por rol
    if (role && role !== 'all') {
        filterConditions.role = role;
    }

    try {
        const employees = await Employee.find(filterConditions);
        res.status(200).json({
            success: true,
            message: 'Empleados obtenidos con filtros aplicados',
            employees,
        });
    } catch (error) {
        console.error("Error al obtener empleados con filtros:", error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener empleados con filtros',
            error: error.message,
        });
    }
};

// Controlador para editar un empleado en una sucursal
export const editEmployeeInBranch = async (req, res) => {
    const { id } = req.params; // ID del empleado a editar
    const { name, ci, phone, email, contractStart, contractEnd, salary, role } = req.body;
    const photo = req.file ? req.file.filename : null; // Nueva foto si se sube

    try {
        // Verificar si el empleado existe
        const updatedEmployee = await Employee.findByIdAndUpdate(
            id,
            { name, ci, phone, email, contractStart, contractEnd, salary, role, ...(photo && { photo }) },
            { new: true }
        );

        if (!updatedEmployee) {
            return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
        }

        res.status(200).json({
            success: true,
            message: 'Empleado actualizado exitosamente',
            employee: updatedEmployee,
        });
    } catch (error) {
        console.error("Error al actualizar empleado:", error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el empleado',
            error: error.message,
        });
    }
};

// Controlador para eliminar un empleado de una sucursal
export const deleteEmployeeFromBranch = async (req, res) => {
    const { id } = req.params; // ID del empleado a eliminar

    try {
        const employee = await Employee.findByIdAndDelete(id);

        if (!employee) {
            return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
        }

        // También elimina el empleado de la lista de empleados en la sucursal
        await Branch.updateOne(
            { employees: id },
            { $pull: { employees: id } }
        );

        res.status(200).json({
            success: true,
            message: 'Empleado eliminado exitosamente',
        });
    } catch (error) {
        console.error("Error al eliminar empleado:", error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el empleado',
            error: error.message,
        });
    }
};
