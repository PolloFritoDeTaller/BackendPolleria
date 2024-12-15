import Product from '../models/product.model.js';

export const registerProduct = async (req, res) => {
    const { name, price, id, description } = req.body;
    const image = req.file ? req.file.path : null;
    
    console.log('Archivo subido:', req.file); // Esto debería mostrar detalles del archivo si se envió correctamente
    console.log('Datos del cuerpo:', req.body);

    const newProduct = new Product({
        name,
        price,
        id,
        image: req.file.filename, 
        description
    });

    try {
        const savedProduct = await newProduct.save();
        res.json(savedProduct);
    } catch (error) {
        res.json(error);
    }
};


export const getProductDB = async (req, res) => {
    const idProduct = req.params.id; 
    try{
        const productFound = await Product.findById(idProduct);

        if(!productFound) return res.json({message: "Product not found"});

        res.json(productFound);

    } catch(error) {
        res.json(error);
    }
};
export const getProductsDB = async (req, res) => {
    try{
        const products = await Product.find();
        
        res.json(products);
    } catch(error){
        res.json(error);
    }
}