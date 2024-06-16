const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductScheme = new Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        // Remove leading and trailing whitespace
        trim: true,
        minlength: [3, 'name must be at least 3 characters long'],
        maxlength: [100, 'name must be less than 100 characters']
    },
    DESC: {
        type: String,
        // Remove leading and trailing whitespace
        trim: true,
        minlength: [10, 'Description must be at least 10 characters long'],
        maxlength: [1000, 'Description must be less than 1000 characters']
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
        // 1 - male
        // 2 - female
        // 3 - unisex
        enum: {
            values: [1, 2, 3],
            message: 'Gender must be 1 (male), 2 (female), or 3 (unisex)'
        }
    },
    size: {
        // ml
        type: Number,
        required: [true, 'Product size is required'],
        min: [1, 'Size must be at least 1'],
        max: [1000, 'Size must be below 1000']
    }
}, {collection: 'products', timestamps: true}); // timestamps: 'true' adds createdAt and updatedAt fields



const Product = mongoose.model('product', ProductScheme);
module.exports = Product;