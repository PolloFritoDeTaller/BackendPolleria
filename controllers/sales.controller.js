import Sale from '../models/sale.model.js';
import Product from '../models/product.model.js';

// Obtener todas las ventas
export const getSalesDB = async (req, res) => {
    try {
        const sales = await Sale.find();
        console.log("Ventas encontradas: ", sales);  // Verifica si las ventas se encuentran correctamente
        res.json(sales);
    } catch (error) {
        console.log("Error obteniendo ventas: ", error);
        res.status(500).json({ success: false, message: 'Error obteniendo ventas', error });
    }
};

// Obtener las ventas de hoy
export const getTodaySalesDB = async (req, res) => {
    try {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(startOfDay);
        endOfDay.setDate(startOfDay.getDate() + 1);

        const todaySales = await Sale.find({
            saleDate: {
                $gte: startOfDay,
                $lt: endOfDay
            }
        });

        console.log("Ventas de hoy encontradas: ", todaySales);  // Verificar las ventas del día
        res.json(todaySales);
    } catch (error) {
        console.error("Error al obtener las ventas de hoy: ", error);
        res.status(500).json({ success: false, message: 'Error al obtener las ventas del día de hoy', error });
    }
};

// Obtener una venta por ID
export const getSaleDB = async (req, res) => {
    const idSale = req.params.id;

    try {
        const saleFound = await Sale.findById(idSale);
        if (!saleFound) {
            return res.status(404).json({ success: false, message: "Venta no encontrada" });
        }

        res.json({ success: true, sale: saleFound });
    } catch (error) {
        console.error("Error al obtener la venta: ", error);
        res.status(500).json({ success: false, message: 'Error al obtener la venta', error });
    }
};

// Registrar una nueva venta
export const registerSale = async (req, res) => {
    const {
        clientName,
        clientCI,
        paymentMethod,
        discount,
        saleDate,
        products,
        total
    } = req.body;

    // Verificar que los campos obligatorios estén presentes
    if (!clientName || !clientCI || !paymentMethod || !products || !total) {
        return res.status(400).json({
            success: false,
            message: 'Faltan campos obligatorios en la solicitud'
        });
    }

    let parsedProducts;
    try {
        // Verificar y parsear los productos si son un string (en caso de ser enviado como JSON)
        parsedProducts = typeof products === 'string' ? JSON.parse(products) : products;
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Formato de datos de productos inválido'
        });
    }

    // Verificar que los productos sean un arreglo
    if (!Array.isArray(parsedProducts)) {
        return res.status(400).json({
            success: false,
            message: 'Los productos deben ser un arreglo'
        });
    }

    try {
        // Verificar los detalles de cada producto y generar el formato correcto para la venta
        const productsWithDetails = await Promise.all(
            parsedProducts.map(async (item) => {
                const product = await Product.findById(item.productId);
                if (!product) {
                    throw new Error(`Producto con ID ${item.productId} no encontrado`);
                }
                return {
                    productId: product._id,
                    name: product.name,
                    price: parseFloat(item.price),
                    quantity: parseInt(item.quantity)
                };
            })
        );

        // Crear una nueva venta con los detalles
        const newSale = new Sale({
            clientName,
            clientCI,
            products: productsWithDetails,
            discount: parseFloat(discount || 0),
            totalAmount: parseFloat(total),
            paymentMethod,
            saleDate: saleDate ? new Date(saleDate) : new Date()  // Usar la fecha actual si no se proporciona
        });

        // Guardar la nueva venta en la base de datos
        const savedSale = await newSale.save();
        res.status(201).json({
            success: true,
            message: 'Venta registrada exitosamente',
            sale: savedSale
        });
    } catch (error) {
        console.error("Error al registrar la venta: ", error);
        res.status(500).json({
            success: false,
            message: 'Error al registrar la venta',
            error: error.message
        });
    }
};
export const getSalesByDateDB = async (req, res) => {
    const { date } = req.params; // Obtiene la fecha en formato YYYY-MM-DD
    
    // Convierte la fecha a un objeto Date
    const startDate = new Date(date);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1); // Para incluir todas las ventas del día

    try {
        const sales = await Sale.find({
            saleDate: { // Cambiado de date a saleDate
                $gte: startDate,
                $lt: endDate,
            },
        });

        res.json(sales);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener las ventas por fecha." });
    }
};
export const getSalesByHourDB = async (req, res) => {
    const { startHour, endHour } = req.params; // Obtiene las horas en formato HH:mm

    // Convierte las horas a objetos Date
    const startDate = new Date();
    const endDate = new Date();
    
    // Establece la hora de inicio
    const [startHourValue, startMinuteValue] = startHour.split(':').map(Number);
    startDate.setHours(startHourValue, startMinuteValue, 0, 0);
    
    // Establece la hora de fin
    const [endHourValue, endMinuteValue] = endHour.split(':').map(Number);
    endDate.setHours(endHourValue, endMinuteValue, 59, 999); // Hasta el final del último minuto

    try {
        const sales = await Sale.find({
            saleDate: {
                $gte: startDate,
                $lt: endDate,
            },
        });

        res.json(sales);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener las ventas por hora." });
    }
};
