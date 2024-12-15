import Employee from '../models/employees.model.js';
import bcrypt from 'bcrypt';

// Registrar un nuevo empleado
export const registerEmployee = async (req, res) => {
    const { name, ci, phone, email, password, contractStart, contractEnd, salary, role } = req.body;
    const photo = req.file ? req.file.path : null; // Si se subió una foto, se almacena la ruta

    console.log('Archivo subido:', req.file); // Muestra detalles del archivo si fue subido correctamente
    console.log('Datos del cuerpo:', req.body);

    // Encriptar la contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(password, 10);

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
        photo: req.file ? req.file.filename : null,  // Guarda el nombre del archivo si se subió
    });

    try {
        const savedEmployee = await newEmployee.save();
        res.json(savedEmployee);
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar empleado', details: error });
    }
};

// Obtener un empleado por ID
export const getEmployeeById = async (req, res) => {
    const { id } = req.params;

    try {
        const employeeFound = await Employee.findById(id);

        if (!employeeFound) {
            return res.status(404).json({ message: "Empleado no encontrado" });
        }

        res.json(employeeFound);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener empleado', details: error });
    }
};

export const getEmployees = async function(req, res) {
    try {
        const employees = await Employee.find();
        res.json(employees);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener empleados', details: error });
    }
};

// Obtener un empleado por CI
export const getEmployeeByCi = async (req, res) => {
    const { ci } = req.params;

    try {
        const employeeFound = await Employee.findByCi(ci);

        if (!employeeFound) {
            return res.status(404).json({ message: "Empleado no encontrado" });
        }

        res.json(employeeFound);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener empleado', details: error });
    }
};

