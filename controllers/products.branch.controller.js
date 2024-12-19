import Branch from '../models/branch.model.js';
import Product from '../models/product.model.js';

// Controlador para agregar un producto a una sucursal
export const addProductToBranch = async (req, res) => {
    try {
        const { nameBranch, nameProduct, price, id, description, image } = req.body;
        console.log(nameBranch, nameProduct, price, id, description);

        const branch = await Branch.findOne({ nameBranch: nameBranch });

        if (!branch) {
            return res.status(404).json({ success: false, message: 'Sucursal no encontrada' });
        }

        const existingProduct = await Product.findOne({ id });
        if (existingProduct) {
            return res.status(400).json({ success: false, message: 'Ya existe un producto con ese ID' });
        }

        const newProduct = new Product({
            nameProduct,
            price,
            id,
            image,
            description
        });

        const savedProduct = await newProduct.save();

        branch.products.push(savedProduct._id);
        await branch.save();

        res.status(200).json({
            success: true,
            message: `Producto agregado exitosamente a la sucursal ${branch.nameBranch}`,
            branch,
            product: savedProduct
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al agregar producto a la sucursal',
            error: error.message
        });
    }
};

// Controlador para obtener los productos de una sucursal
export const getProductsByBranch = async (req, res) => {
    try {
        const { nameBranch } = req.body;
        console.log("getProductsByBranch", nameBranch);

        const branch = await Branch.findOne({ nameBranch: nameBranch }).populate('products');

        if (!branch) {
            return res.status(404).json({ success: false, message: 'Sucursal no encontrada' });
        }

        res.status(200).json({
            success: true,
            message: 'Productos obtenidos exitosamente',
            products: branch.products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener productos de la sucursal',
            error: error.message
        });
    }
};

// Controlador para editar un producto en una sucursal
export const editProductInBranch = async (req, res) => {
    try {
        const { id } = req.params;
        const { id: newId, nameProduct, price, description, image } = req.body;

        const existingProduct = await Product.findById(id);
        if (!existingProduct) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }

        const updatedProductData = {
            id: newId || id,
            nameProduct,
            price,
            description,
            image: image || existingProduct.image
        };

        const updatedProduct = await Product.findByIdAndUpdate(id, updatedProductData, { new: true });

        res.status(200).json({
            success: true,
            message: 'Producto actualizado exitosamente',
            product: updatedProduct
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el producto',
            error: error.message
        });
    }
};

// Controlador para eliminar un producto de una sucursal
export const deleteProductFromBranch = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }

        await Branch.updateOne(
            { products: id },
            { $pull: { products: id } }
        );

        res.status(200).json({
            success: true,
            message: 'Producto eliminado exitosamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el producto',
            error: error.message
        });
    }
};

export const updateProductRecipe = async (req, res) => {
    try {
        const { productId } = req.params;
        const { recipe } = req.body;
        
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            { recipe },
            { new: true }
        );

        res.json({
            success: true,
            message: 'Receta actualizada exitosamente',
            product: updatedProduct
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar la receta',
            error: error.message
        });
    }
};