const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CartScheme = new Schema({
    customer_id: {
        type: String,
        required: [true, 'Product title is required'],
        // Remove leading and trailing whitespace
        trim: true,
        minlength: [3, 'Title must be at least 3 characters long'],
        maxlength: [100, 'Title must be less than 100 characters']
    },
    product_id: {
        type: [String],
        required: true,
        validate: {
            validator: (productIds) => {
            // Validation logic for each product_id within the array
                return productIds.every((productId) => {
                    // Product ID validation
                    return typeof productId === 'string' && productId.trim().length > 0; // Check for string and non-empty
                });
            },
            message: 'Product IDs must be an array of non-empty strings',
        },
    },
});

const Cart = mongoose.model('cart', CartScheme);
module.exports = Cart;