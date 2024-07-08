const mongoose = require('mongoose');
const Order = require('../models/order');
const Product = require('../models/product');
const globalState = require('../globalState'); // Import global state
const Cart = require('../models/cart');
const User = require('../models/user');

exports.createOrder = async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).send('Service unavailable. Please try again later.');
    }

    try {
        //Find the right cart to get the products from 
        const cartId = globalState.cartId;
        const cart = await Cart.findById(cartId);

        // Push the new order id to user's array 
        const currentUser = await User.findOne({ cartId: cartId });
        if (!currentUser) {
            return res.status(404).send('User not found');
        }

        // Fetch product details for each product in the cart
        const orderItems = await Promise.all(cart.products.map(async (cartItem) => {
            const product = await Product.findById(cartItem.productId);
            if (!product) {
                throw new Error(`Product with id ${cartItem.productId} not found`);
            }
            
            return {
                productId: product._id,
                quantity: cartItem.quantity,
                price: product.price // Assuming product has a price field
            };
        }));

        // Save the order
        const order = new Order({
            order_items: orderItems,
            userId: currentUser._id,
            status: 2,
        });

        console.log(order);

        await order.save();

        res.redirect('/viewCart');
    } catch (err) {
        console.error('Error creating order:', err);

        // Handle validation errors
        if (err.name === 'ValidationError') {
            return res.status(400).send({ message: 'Validation error', errors: err.errors });
        }

        // For other types of errors, send a generic server error response
        res.status(500).send('Server error');
    }
};

exports.getOrders = async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).send('Service unavailable. Please try again later.');
    }

    try {
        const orders = await Order.find();
        res.json(orders);
    } catch (err) {
        console.error('Error getting orders:', err);
        res.status(500).send('Server error');
    }
};

exports.getOrderById = async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).send('Service unavailable. Please try again later.');
    }

    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).send('Order not found');
        }
        res.json(order);
    } catch (err) {
        console.error('Error getting order by ID:', err);
        res.status(500).send('Server error');
    }
};