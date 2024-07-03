// user.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator = require('validator');

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        trim: true, // Remove leading and trailing whitespace
        minlength: [3, 'First name must be at least 3 characters long'],
        maxlength: [30, 'First name must be less than 30 characters']
    },
    lastName: {
        type: String,
        required: true,
        trim: true, // Remove leading and trailing whitespace
        minlength: [3, 'Last name must be at least 3 characters long'],
        maxlength: [30, 'Last name must be less than 30 characters']
    },
    bio: {
        type: String,
        required: true,
        maxlength: [100, 'Bio must be less than 100 characters']
    },
    address: {
        type: String,
        required: true,
        minlength: [3, 'Address must be at least 3 characters long'],
        maxlength: [100, 'Address must be less than 100 characters']
    },
    access: {
        type: String,
        enum: ['user', 'admin'],
        required: true
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
          validator: validator.isEmail, // Use validator for email format
          message: 'Invalid email format'
        }
    },
    password: {
        type: String,
        required: true
    },
    cartId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'cart',
    },
    orders: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Order',
    }
});

module.exports = mongoose.model('User', userSchema);
