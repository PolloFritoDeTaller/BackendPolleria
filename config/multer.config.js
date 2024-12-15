import multer from 'multer';

// Configuración del almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Ruta donde se almacenarán los archivos
  },
  filename: (req, file, cb) => {
    // Nombre del archivo con un timestamp y el nombre original
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Filtro para permitir solo ciertos tipos de archivos
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']; // Tipos de archivos permitidos
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Permitir el archivo
  } else {
    cb(new Error('Tipo de archivo no permitido'), false); // Rechazar el archivo
  }
};

// Configuración de multer
const upload = multer({ 
  storage,
  fileFilter, // Agregar el filtro de archivos
  limits: { fileSize: 5 * 1024 * 1024 }, // Limitar el tamaño del archivo a 5 MB
});

// Exportar el middleware de carga
export default upload;
