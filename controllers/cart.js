const mongoose = require('mongoose');
const Cart = require('../models/cart');

// !!!!!!!!!!! sprint 2 - because we need users !!!!!
// this one is just an intuition

exports.createCart = async(req, res) => {
    // Check if the database is connected
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).send('Service unavailable. Please try again later.');
    }

    try {
        const newCart = new Cart();
        await newCart.save();
        res.status(201).send('Cart created successfully!');
    } catch (err) {
        console.error('Error creating cart:', err);
        res.status(500).send('Server error');
    }
};

exports.AddToCart = async(req, res) => {
    // Check if the database is connected
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).send('Service unavailable. Please try again later.');
    }

    try {
        // !!!!!!!!!!! sprint 2 - because we need users first !!!!!
        // at sprint 2 we need to get the user id from the session and not from the request body
        const cart = await Cart.findOne(req.body.id);
        const existingProductIndex = cart.products.findIndex(p => p.productId.toString() === req.params.productId);
        if (existingProductIndex >= 0) {
            cart.products[existingProductIndex].quantity += 1; // Increment quantity if product exists
        } else {
            cart.products.push({ productId: req.params.productId, quantity: 1 }); // Add new product with quantity 1
        }
        await cart.save();
        res.status(201).send('Product added to cart successfully!');
    } catch (err) {
        console.error('Error adding product to cart:', err);
        res.status(500).send('Server error');
    }
}

exports.getAllCarts = async(req, res) => {
    // Check if the database is connected
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).send('Service unavailable. Please try again later.');
    }

    try {
        const carts = await Cart.find();
        res.json(carts);
    } catch (err) {
        console.error('Error getting carts:', err);
        res.status(500).send('Server error');
    }
};


exports.deleteCart = async (req, res) => {
    //check if the database is connected
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).send('Service unavailable. Please try again later.');
    }

    try {
        //find cart id from req body
        const cartId = req.body.cartId;
        const cart = await Cart.findByIdAndDelete(cartId);

        //check if the cart is found
        if (!cart) {
            return res.status(404).send('Cart not found');
        }

        res.status(200).send('Cart deleted successfully!');
    } catch (err) {
        console.error('Error deleting cart:', err);
        res.status(500).send('Server error');
    }
};

  
  
// !!!!!!!!!!! sprint 2 - because we need users first !!!!!

// exports.getCartById = async(req, res) => {
// };