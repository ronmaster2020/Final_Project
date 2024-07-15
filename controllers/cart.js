const Cart = require('../models/cart');
const Product = require('../models/product');

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
    const { productId } = req.params;
    const { quantity } = req.body;

    try {
        const cart = await Cart.findOne({ userId: req.user._id });

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const cartItem = cart.products.find(item => item.productId.toString() === productId);

        if (cartItem) {
            cartItem.quantity += quantity;
        } else {
            cart.products.push({ productId, quantity });
        }

        const updatedCart = await cart.save();
        res.json(updatedCart);
    } catch (err) {
        console.error('Error adding to cart:', err);
        res.status(500).json({ error: 'Error adding to cart' });
    }
};


const getCart = async (req, res) => {
    try {
        const userId = req.user._id; // Assuming req.user._id is correctly set after authentication
        const cart = await Cart.findOne({ userId }).populate('products.productId');

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        res.json(cart);
    } catch (err) {
        console.error('Error fetching cart:', err);
        res.status(500).json({ error: 'Error fetching cart' });
    }
};

const getCartById = async (req, res) => {
    try {
        const cart = await Cart.findById(req.params.cartId).populate('products.productId');

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        res.json(cart);
    } catch (err) {
        console.error('Error fetching cart:', err);
        res.status(500).json({ error: 'Error fetching cart' });
    }
};

const updateCart = async (req, res) => {
    const { id } = req.params;
    const { products } = req.body;

    try {
        const cart = await Cart.findByIdAndUpdate(id, { products }, { new: true });

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        res.json(cart);
    } catch (err) {
        console.error('Error updating cart:', err);
        res.status(500).json({ error: 'Error updating cart' });
    }
};

const deleteCart = async (req, res) => {
    try {
        const cart = await Cart.findByIdAndDelete(req.params.id);

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        res.json({ message: 'Cart deleted' });
    } catch (err) {
        console.error('Error deleting cart:', err);
        res.status(500).json({ error: 'Error deleting cart' });
    }
};

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
