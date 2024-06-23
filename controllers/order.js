const mongoose = require('mongoose');
const Order = require('../models/order');
const Product = require('../models/product');

exports.createOrder = async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).send('Service unavailable. Please try again later.');
    }

    try {
        // Access the order_items value (assuming only one product)
        const selectedProductIds = req.body.order_items; 
        console.log(selectedProductIds);

        // Save the order
        const order = new Order({
            order_items: selectedProductIds,
        });
        await order.save();
        res.json(order);
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