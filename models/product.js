const mongoose = require('mongoose');
const Schema = mongoose.Schema; // Import Schema from mongoose

const ProductScheme = new Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    gender: {
        type: String,
        required: true
    }
});

const Product = mongoose.model('product', ProductScheme);
module.exports = Product;
