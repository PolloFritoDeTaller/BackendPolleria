import mongoose, { Schema } from 'mongoose';

const productModel = new Schema({
  nameProduct: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'El precio debe ser mayor que 0']
  },
  id: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: true,
  },
  // Ingredientes que tiene cada producto
  recipe: [{
    ingredientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ingredient',
    },
    name: String, // Para reducir lookups
    amount: {
      type: Number,
      min: 0
    },
    unit: String // Para mantener consistencia con el ingrediente
  }]
});

export default mongoose.model('Product', productModel);
