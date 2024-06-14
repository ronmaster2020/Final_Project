const mongoose = require('mongoose');
const Product = require('../models/product');

// Create a new product
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

// Get all products
exports.getProducts = async (req, res) => {
    // Check if the database is connected
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).send('Service unavailable. Please try again later.');
    }

    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        console.error('Error getting products:', err);
        res.status(500).send('Server error');
    }
};

// Get a single product by ID
exports.getProductById = async (req, res) => {
    // Check if the database is connected
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).send('Service unavailable. Please try again later.');
    }

    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send('Product not found');
        }
        res.json(product);
    } catch (err) {
        console.error('Error getting product by ID:', err);
        res.status(500).send('Server error');
    }
};

// Update a product by ID
exports.updateProduct = async (req, res) => {
    // Check if the database is connected
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).send('Service unavailable. Please try again later.');
    }

    try {
        const { title, price, gender} = req.body;
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send('Product not found');
        }
        product.title = title;
        product.price = price;
        product.gender = gender;
        await product.save();
        res.send('Product updated successfully');
    }
    catch (err) {
        if (err.name === 'ValidationError') {
            // Handle Mongoose validation errors
            const messages = Object.values(err.errors).map(val => val.message);
            res.status(400).send({ errors: messages });
        } else {
            // Log the error and send a generic server error message
            console.error('Error updating product:', err);
            res.status(500).send('Server error');
        }
    }
}

// Delete a product by ID
exports.deleteProduct = async (req, res) => {
    // Check if the database is connected
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).send('Service unavailable. Please try again later.');
    }

    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send('Product not found');
        }
        await product.remove();
        res.send('Product deleted successfully');
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).send('Server error');
    }
};

// Search for products by attributes (title, price, )
exports.searchProducts = async (req, res) => {
    //sprint 2
};