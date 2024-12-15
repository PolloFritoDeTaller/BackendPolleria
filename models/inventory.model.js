import mongoose, { Schema } from 'mongoose';

const inventoryMovementSchema = new Schema({
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    type: {
        type: String,
        enum: ['sale', 'purchase', 'adjustment'],
        required: true
    },
    ingredientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ingredient',
        required: true
    },
    ingredientName: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        required: true
    },
    reference: {
        type: String,
        required: true
    }
});

const dailyInventorySchema = new Schema({
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    ingredients: [{
        ingredientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Ingredient',
            required: true
        },
        name: String,
        initialStock: {
            type: Number,
            required: true,
            min: 0
        },
        movements: [inventoryMovementSchema],
        finalStock: {
            type: Number,
            required: true,
            min: 0
        }
    }],
    employees: [{
        employeeCi: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Employee',
            required: true
        },
        name: String
    }],
    observations: String,
    status: {
        type: String,
        enum: ['open', 'closed'],
        default: 'open'
    }
});

export const DailyInventory = mongoose.model('DailyInventory', dailyInventorySchema);
export const InventoryMovement = mongoose.model('InventoryMovement', inventoryMovementSchema);