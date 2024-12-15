import mongoose, { Schema } from 'mongoose';

const ingredientModel = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'g', 'l', 'ml', 'unidad']
  },
  currentStock: {
    type: Number,
    required: true,
    min: 0
  },
  cost: {
    type: Number,
    required: true,
    min: 0
  }
});

export const Ingredient = mongoose.model('Ingredient', ingredientModel);