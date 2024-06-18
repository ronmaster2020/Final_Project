const mongoose = require('mongoose');
const Cart = require('../models/cart');
const { findById } = require('../models/product');

exports.AddToCart = async(req, res) => {
    // Check if the database is connected
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).send('Service unavailable. Please try again later.');
    }
    
    try {
        const cart = await Cart.findOne({ customer_id: req.body.customer_id });
        
        if(cart) {
            cart.product_id.push(req.body.product_id);
            await cart.save();
            res.send(cart.product_id + ' was added to cart successfully');
            console.log('Product added to cart successfully');
        }
        else {
            const { customer_id, product_id } = req.body;
            const cart = new Cart({
                customer_id,
                product_id,
            });
            await cart.save();
            res.send(cart.customer_id + ' was created');
            console.log('Product ' + cart.product_id + ' added to cart successfully');
        }
    } catch (err) {
        console.error('Error adding product to cart:', err);
        res.status(500).send('Server error');
    }
}