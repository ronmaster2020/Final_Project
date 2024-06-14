const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductScheme = new Schema({
    title: {
        type: String,
        required: [true, 'Product title is required'],
        // Remove leading and trailing whitespace
        trim: true,
        minlength: [3, 'Title must be at least 3 characters long'],
        maxlength: [100, 'Title must be less than 100 characters']
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0.01, 'Price must be at least 0.01'],
        max: [10000, 'Price must be below 10000']
    },
    gender: {
        type: String,
        required: [true, 'Product gender is required'],
        // one of the values in the enum array
        // 0 - male
        // 1 - female
        // 2 - unisex
        enum: {
            values: [0, 1, 2],
            message: 'Gender must be 0 (male), 1 (female), or 2 (unisex)'
        }
    }
});


const Product = mongoose.model('product', ProductScheme);
module.exports = Product;