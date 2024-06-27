const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductScheme = new Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true, // Remove leading and trailing whitespace
        minlength: [3, 'name must be at least 3 characters long'],
        maxlength: [100, 'name must be less than 100 characters']
    },
    DESC: {
        type: String,
        trim: true, // Remove leading and trailing whitespace
        minlength: [10, 'Description must be at least 10 characters long'],
        maxlength: [1000, 'Description must be less than 1000 characters']
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0.01, 'Price must be at least 0.01'],
        max: [1000, 'Price must be below 1000']
    },
    gender: {
        type: String,
        required: [true, 'Product gender is required'],
        enum: {
            values: [1, 2, 3],
            message: 'Gender must be 1 (male), 2 (female), or 3 (unisex)'
        }
    },
    size: {
        type: Number,
        required: [true, 'Product size is required'],
        min: [1, 'Size must be at least 1'],
        max: [1000, 'Size must be below 1000']
    }
}, { collection: 'products', timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', ProductScheme);

module.exports = Product;
