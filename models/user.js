const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    bio: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    access: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
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
