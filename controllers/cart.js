const mongoose = require('mongoose');
const Cart = require('../models/cart');

exports.AddToCart = async(req, res) => {
    // Check if the database is connected
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).send('Service unavailable. Please try again later.');
    }

    
}