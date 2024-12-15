import Branch from '../models/branch.model.js';
import Sale from '../models/sale.model.js';
import Product from '../models/product.model.js';

export const addSaleToBranch = async (req, res) => {
    try {
        const { nameBranch, clientName, clientCI, products, discount = 0 } = req.body;

        const branch = await Branch.findOne({ nameBranch: nameBranch.toLowerCase() });
        if (!branch) {
            return res.status(404).json({ success: false, message: 'Sucursal no encontrada' });
        }

        const saleProducts = [];
        let totalAmount = 0;

        for (const item of products) {
            const { productId, quantity } = item;
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({ success: false, message: `Producto con ID ${productId} no encontrado` });
            }

            const productTotal = product.price * quantity;
            totalAmount += productTotal;

            saleProducts.push({
                productId: product._id,
                name: product.nameProduct,
                price: product.price,
                quantity
            });
        }

        totalAmount -= (totalAmount * (discount / 100));

        const newSale = new Sale({
            clientName,
            clientCI,
            products: saleProducts,
            discount,
            totalAmount,
        });

        const savedSale = await newSale.save();

        branch.sales.push(savedSale._id);
        await branch.save();

        res.status(200).json({
            success: true,
            message: `Venta registrada exitosamente en la sucursal ${branch.nameBranch}`,
            sale: savedSale
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al registrar la venta',
            error: error.message
        });
    }
};


export const getSalesByBranch = async (req, res) => {
    try {
        const { nameBranch } = req.body;

        // Buscar la sucursal por nombre
        const branch = await Branch.findOne({ nameBranch: nameBranch.toLowerCase() })
            .populate('sales'); // Esto traerá las ventas asociadas a la sucursal

        if (!branch) {
            return res.status(404).json({ success: false, message: 'Sucursal no encontrada' });
        }

        res.status(200).json({
            success: true,
            message: 'Ventas obtenidas exitosamente',
            sales: branch.sales // Aquí están todas las ventas de la sucursal
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener las ventas de la sucursal',
            error: error.message
        });
    }
};

export const getTodaySalesByBranch = async (req, res) => {
    try {
        const { nameBranch } = req.body;
        console.log(nameBranch)

        // Buscar la sucursal por nombre
        const branch = await Branch.findOne({ nameBranch: nameBranch.toLowerCase() });
        if (!branch) {
            return res.status(404).json({ success: false, message: 'Sucursal no encontrada' });
        }

        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(startOfDay);
        endOfDay.setDate(startOfDay.getDate() + 1);

        const todaySales = await Sale.find({
            saleDate: {
                $gte: startOfDay,
                $lt: endOfDay
            },
            _id: { $in: branch.sales } // Filtramos las ventas de la sucursal
        });

        console.log("Ventas de hoy encontradas: ", todaySales);  // Verificar las ventas del día
        res.json({
            success: true,
            message: 'Ventas de hoy obtenidas exitosamente',
            sales: todaySales
        });
    } catch (error) {
        console.error("Error al obtener las ventas de hoy: ", error);
        res.status(500).json({ success: false, message: 'Error al obtener las ventas del día de hoy', error });
    }
};

// Obtener ventas por hora
export const getSalesByHourDB = async (req, res) => {
    const { startHour, endHour, nameBranch } = req.params; // Obtiene las horas en formato HH:mm

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
        // Buscar la sucursal por nombre
        const branch = await Branch.findOne({ nameBranch: nameBranch.toLowerCase() });
        if (!branch) {
            return res.status(404).json({ success: false, message: 'Sucursal no encontrada' });
        }

        const sales = await Sale.find({
            saleDate: {
                $gte: startDate,
                $lt: endDate,
            },
            _id: { $in: branch.sales } // Filtramos las ventas de la sucursal
        });

        res.status(200).json({
            success: true,
            message: 'Ventas obtenidas por hora exitosamente',
            sales
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error al obtener las ventas por hora.", error });
    }
};
export const getSalesByDateDB = async (req, res) => {
    const { date, nameBranch } = req.params;

    console.log("Fecha recibida:", date);
    console.log("Sucursal recibida:", nameBranch);

    const startDate = new Date(date);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1);

    try {
        const branch = await Branch.findOne({ nameBranch: nameBranch.toLowerCase() });
        if (!branch) {
            return res.status(404).json({ success: false, message: 'Sucursal no encontrada' });
        }

        const sales = await Sale.find({
            saleDate: {
                $gte: startDate,
                $lt: endDate,
            },
            _id: { $in: branch.sales }
        });

        res.status(200).json({
            success: true,
            message: 'Ventas obtenidas por fecha exitosamente',
            sales
        });
    } catch (error) {
        console.error("Error en getSalesByDateDB:", error);
        res.status(500).json({ success: false, message: "Error al obtener las ventas por fecha.", error: error.message });
    }
};

export const getWeeklyProfitsByBranch = async (req, res) => {
    try {
        const { nameBranch } = req.params;
        const branch = await Branch.findOne({ nameBranch: nameBranch.toLowerCase() });
        if (!branch) {
            return res.status(404).json({ success: false, message: 'Sucursal no encontrada' });
        }

        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 7);

        const sales = await Sale.find({
            saleDate: {
                $gte: startDate,
                $lt: endDate
            },
            _id: { $in: branch.sales }
        });

        const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        
        // Calcular costo total de ingredientes
        let totalCost = 0;
        for (const sale of sales) {
            for (const item of sale.products) {
                const product = await Product.findById(item.productId).populate('recipe.ingredientId');
                if (product && product.recipe) {
                    const productCost = product.recipe.reduce((cost, ingredient) => {
                        return cost + (ingredient.amount * ingredient.ingredientId.costPerUnit);
                    }, 0);
                    totalCost += productCost * item.quantity;
                }
            }
        }

        const profit = totalRevenue - totalCost;

        res.status(200).json({
            success: true,
            data: {
                totalRevenue,
                totalCost,
                profit,
                salesCount: sales.length,
                startDate,
                endDate
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al calcular ganancias semanales',
            error: error.message
        });
    }
};