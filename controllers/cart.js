const mongoose = require('mongoose');
const User = require('../models/user');
const Cart = require('../models/cart');

// Middleware to check DB connection
const checkDBConnection = (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).send('Service unavailable. Please try again later.');
    }
    next();
};

// Create a new cart
const createCart = async (req, res) => {
    const { userId } = req.body;
    const cart = new Cart({ userId, products: [] });
    try {
        const savedCart = await cart.save();
        res.status(201).json(savedCart);
    } catch (err) {
        console.error('Error creating cart:', err);
        res.status(500).json({ error: 'Error creating cart' });
    }
};

const addToCart = async (req, res) => {
    const userId = req.session.userId;
    const { productId, quantity } = req.body;

    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!productId) {
        return res.status(400).json({ error: 'Product ID is required' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const cartId = user.cartId;
        let cart = await Cart.findOne({ _id: cartId });

        if (!cart) {
            cart = new Cart({ userId, products: [] });
        }

        const existingProduct = cart.products.find(item => item.productId.equals(productId));
        if (existingProduct) {
            existingProduct.quantity += quantity;
        } else {
            cart.products.push({ productId, quantity });
        }

        await cart.save();
        res.json({ success: true, cart });
    } catch (err) {
        console.error('Error adding to cart:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get the cart for the current user
const getCart = async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const cartId = user.cartId;
        const cart = await Cart.findOne({ _id: cartId }).populate('products.productId');

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        res.json(cart);
    } catch (err) {
        console.error('Error fetching cart:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get cart by ID
const getCartById = async (req, res) => {
    try {
        const cart = await Cart.findById(req.params.cartId).populate('products.productId');

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        res.json(cart);
    } catch (err) {
        console.error('Error fetching cart by ID:', err);
        res.status(500).json({ error: 'Error fetching cart' });
    }
};

// Update the cart
const updateCart = async (req, res) => {
    const userId = req.session.userId;
    const { products } = req.body;

    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const cartId = user.cartId;
        const cart = await Cart.findByIdAndUpdate(cartId, { products }, { new: true });

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        res.json(cart);
    } catch (err) {
        console.error('Error updating cart:', err);
        res.status(500).json({ error: 'Error updating cart' });
    }
};

// Delete the cart
const deleteCart = async (req, res) => {
    const userId = req.session.userId;

    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const cartId = user.cartId;
        const cart = await Cart.findByIdAndDelete(cartId);

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        res.json({ message: 'Cart deleted' });
    } catch (err) {
        console.error('Error deleting cart:', err);
        res.status(500).json({ error: 'Error deleting cart' });
    }
};

// Get all carts
const getAllCarts = async (req, res) => {
    try {
        const carts = await Cart.find().populate('products.productId');
        res.json(carts);
    } catch (err) {
        console.error('Error fetching carts:', err);
        res.status(500).json({ error: 'Error fetching carts' });
    }
};

module.exports = { createCart, addToCart, getCart, getCartById, updateCart, deleteCart, getAllCarts };