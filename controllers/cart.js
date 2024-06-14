const mongoose = require('mongoose');
const Cart = require('../models/cart');

exports.AddToCart = async(req, res) => {
    // Check if the database is connected
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).send('Service unavailable. Please try again later.');
    }

    try {
        const cart = new Cart({
            customer_id: req.body.customer_id,
            //product_id: req.body.product_id
        });
        await cart.save();
        res.send(cart.customer_id + ' was added to cart successfully');
    } catch (err) {
        console.error('Error adding product to cart:', err);
        res.status(500).send('Server error');
    }

}