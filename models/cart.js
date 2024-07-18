const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CartSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User' 
    },
    products: [{
        productId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Product' 
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        }
    }]
}, {
    timestamps: true // Adds createdAt and updatedAt fields automatically
});

const Cart = mongoose.model('Cart', CartSchema);
module.exports = Cart;
