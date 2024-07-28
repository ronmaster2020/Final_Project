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
    const { productId, quantity } = req.params;

    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!productId) {
        return res.status(400).json({ error: 'Product ID is required' });
    }

    const parsedQuantity = parseInt(quantity, 10);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
        return res.status(400).json({ error: 'Quantity must be a positive number' });
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
            existingProduct.quantity += parsedQuantity;
        } else {
            cart.products.push({ productId, quantity: parsedQuantity });
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
    const { qty_array } = req.body;

    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const cartId = user.cartId;
        const cart = await Cart.findById(cartId);
        let index = 0;
        cart.products.forEach(product => {
            product.quantity = qty_array[index];
            if (product.quantity <= 0) {
                cart.products.splice(index, 1);
            }
            index++;
        });
        console.log('Cart updated:', cart);
        await cart.save();

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        res.json(cart);
    } catch (err) {
        console.error('Error updating cart:', err);
        res.status(500).json({ error: 'Error updating cart' });
    }
};

const deleteProductFromCart = async (req, res) => {
    const userId = req.session.userId;

    const { product } = req.body;

    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const cartId = user.cartId;
        const cart = await Cart.findById(cartId);
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        cart.products.forEach((product, index) => {
            if (product.productId.equals(product._id)) {
                cart.products.splice(index, 1);
                console.log('Product deleted:', product);
            }
        });
        await cart.save();
        res.json(cart);
    } catch (err) {
        console.error('Error deleting product from cart:', err);
        res.status(500).json({ error: 'Error deleting product from cart' });
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

module.exports = { createCart, addToCart, getCart, getCartById, updateCart, deleteProductFromCart,deleteCart, getAllCarts };