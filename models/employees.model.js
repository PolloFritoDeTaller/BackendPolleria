import mongoose, { Schema } from 'mongoose';

const employeeModel = new Schema({
  name: {
    type: String,
    required: true,
  },
  ci: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  contractStart: {
    type: Date,
    required: true,
  },
  contractEnd: {
    type: Date,
    required: true,
  },
  salary: {
    type: Number,
    required: true,
    min: [0, 'El salario debe ser mayor que 0']
  },
  role: {
    type: String,
    required: true,
  },
  photo: {
    type: String, // Almacenará la ruta de la imagen
    required: false,
  }
});

export default mongoose.model('Employee', employeeModel);
