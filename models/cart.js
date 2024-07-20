const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CartScheme = new Schema({
    products: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Product'
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        }
    }]
});

const Cart = mongoose.model('cart', CartScheme);
module.exports = Cart;