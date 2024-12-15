// middleware/addProductMiddleware.js
import { uploadImage } from '../config/multer.config.js'; // Importa la configuración de multer

// Middleware para agregar un producto
export const addProduct = uploadImage; // Usa el middleware configurado
