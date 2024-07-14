const mongoose = require('mongoose');
const validator = require('validator');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
        minlength: [3, 'First name must be at least 3 characters long'],
        maxlength: [30, 'First name must be less than 30 characters']
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        minlength: [3, 'Last name must be at least 3 characters long'],
        maxlength: [30, 'Last name must be less than 30 characters']
    },
    bio: {
        type: String,
        trim: true,
        maxlength: [100, 'Bio must be less than 100 characters']
    },
    address: {
        type: String,
        required: true,
        trim: true,
        minlength: [5, 'Address must be at least 5 characters long'],
        maxlength: [100, 'Address must be less than 100 characters']
    },
    access: {
        type: String,
        required: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return /\d{10}/.test(v); // Simple regex for 10 digit phone number
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate: [validator.isEmail, 'Invalid email']
    },
    cartId: {
        type: Schema.Types.ObjectId,
        ref: 'Cart'
    },
    password: {
        type: String,
        required: true
    }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
