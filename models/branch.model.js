import mongoose, { Schema } from 'mongoose';

const branchModel = new Schema({
  nameBranch: {
    type: String,
    required: true,
    unique: true
  },
  address: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  employees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee', // Empleados que trabajan en esta sucursal
  }],
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', // Productos disponibles en esta sucursal
  }],
  sales: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sale', // Ventas registradas en esta sucursal
  }],
  inventories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DailyInventory'
  }],
  ingredients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ingredient'
  }],
  images: [{
    url: {
      type: String, // URL de la imagen subida
      required: false,
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  texts: [{
    content: {
      type: String, // Texto subido
      required: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

branchModel.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Branch', branchModel);
