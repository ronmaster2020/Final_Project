const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
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
        default: 999,
        min: [0.01, 'Price must be at least 0.01'],
        max: [1000, 'Price must be below 1000']
    },
    gender: {
        type: String,
        default: '3',
        enum: {
            values: ['1', '2', '3'],
            message: 'Gender must be "1" (male), "2" (female), or "3" (unisex)'
        }
    },
    size: {
        type: Number,
        default: 999,
        min: [1, 'Size must be at least 1'],
        max: [1000, 'Size must be below 1000']
    },
    stock: {
        type: Number,
        default: 0,
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

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

module.exports = Product;
