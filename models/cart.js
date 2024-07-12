//models/cart.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CartSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User' // This should match the model name 'User'
    },
    products: [{
        productId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Product' // Assuming 'Product' is the name of your product model
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        }
    }]
});

const Cart = mongoose.model('Cart', CartSchema);
module.exports = Cart;
