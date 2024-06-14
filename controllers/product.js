const mongoose = require('mongoose');
const Product = require('../models/product');

exports.createProduct = async (req, res) => {
    // Check if the database is connected
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).send('Service unavailable. Please try again later.');
    }

    try {
        const { title, price, gender } = req.body;
        const newProduct = new Product({
            title,
            price,
            gender
        });
        await newProduct.save();
        res.status(201).send('Product created successfully!');
    } catch (err) {
        if (err.name === 'ValidationError') {
            // Handle Mongoose validation errors
            const messages = Object.values(err.errors).map(val => val.message);
            res.status(400).send({ errors: messages });
        } else {
            // Log the error and send a generic server error message
            console.error('Error creating product:', err);
            res.status(500).send('Server error');
        }
    }
};