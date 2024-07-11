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
    hash: String,
    salt: String
});

userSchema.methods.setPassword = async function (password) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    this.salt = salt;
    this.hash = hash;
};

userSchema.methods.validatePassword = function (password) {
    return bcrypt.compare(password, this.hash);
};

module.exports = mongoose.model('User', userSchema);
