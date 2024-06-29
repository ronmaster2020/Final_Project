const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductScheme = new Schema({
    name: {
        type: String,
        default: '',
        trim: true, // Remove leading and trailing whitespace
        maxlength: [100, 'name must be less than 100 characters']
    },
    DESC: {
        type: String,
        default: '',
        trim: true, // Remove leading and trailing whitespace
        maxlength: [1000, 'Description must be less than 1000 characters']
    },
    price: {
        type: Number,
        min: [0.01, 'Price must be at least 0.01'],
        max: [1000, 'Price must be below 1000']
    },
    gender: {
        type: String,
        enum: {
            values: [1, 2, 3],
            message: 'Gender must be 1 (male), 2 (female), or 3 (unisex)'
        }
    },
    size: {
        type: Number,
        min: [1, 'Size must be at least 1'],
        max: [1000, 'Size must be below 1000']
    },
    stock: {
        type: Number,
        min: [0, 'Stock must be at least 0'],
    },
    images: {
        type: [String],
        validate: {
            validator: function(files) {
                return files.length <= 10;
            },
            message: 'Number of files must be less than or equal to 10'
        },
        default: []
    }
}, { collection: 'products', timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', ProductScheme);

module.exports = Product;
