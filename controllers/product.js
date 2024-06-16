const mongoose = require('mongoose');
const Product = require('../models/product');

// Create a new product
exports.createProduct = async (req, res) => {
    // Check if the database is connected
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).send('Service unavailable. Please try again later.');
    }

    try {
        const { title, DESC, price, gender, size } = req.body;
        const newProduct = new Product({
            title,
            DESC,
            price,
            gender,
            size
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
        const { title, price, gender, size} = req.body;
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send('Product not found');
        }
        product.title = title;
        product.DESC = DESC;
        product.price = price;
        product.gender = gender;
        product.size = size;
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

// Search for products by attributes (f-letter, price, gender, size)
exports.searchProducts = async (req, res) => {
    const query = {};

    if (req.query.fLetter && req.query.fLetter.length === 1) {
        query.title = { $regex: new RegExp(`^${req.query.fLetter}`), $options: 'i' }; // Ensure it starts with the specified letter, case-insensitive
    }
    if (req.query.price) {
        const priceCategory = parseInt(req.query.price, 10); // Convert to number
        switch (priceCategory) {
            case 1:
                query.price = { $gte: 0, $lte: 19 };
                break;
            case 2:
                query.price = { $gte: 20, $lte: 49 };
                break;
            case 3:
                query.price = { $gte: 50, $lte: 99 };
                break;
            case 4:
                query.price = { $gte: 100, $lte: 149 };
                break;
            case 5:
                query.price = { $gte: 150, $lte: 199 };
                break;
            case 6:
                query.price = { $gte: 200 };
                break;
            default:
                break;
        }
    }
    if (req.query.gender) {
        const genderCategory = parseInt(req.query.gender, 10); // Convert to number
        switch (genderCategory) {
            case 0:
                query.gender = genderCategory;
                break;
            case 1:
                query.gender = genderCategory;                
                break;
            case 2:
                query.gender = genderCategory;
                break;
            default:
                break;
        }
            
    }
    if (req.query.size) {
        const sizeCategory = parseInt(req.query.size, 10); // Convert to number
        switch (sizeCategory) {
            case 1:
                query.size = { $gte: 0, $lte: 19 };
                break;
            case 2:
                query.size = { $gte: 20, $lte: 49 };
                break;
            case 3:
                query.size = { $gte: 50, $lte: 99 };
                break;
            case 4:
                query.size = { $gte: 100, $lte: 149 };
                break;
            case 5:
                query.size = { $gte: 150, $lte: 199 };
                break;
            case 6:
                query.size = { $gte: 200 };
                break;
            default:
                break;
        }
    }
    try {
        const products = await Product.find(query);
        res.json(products);
    } catch (err) {
        console.error('Error searching products:', err);
        res.status(500).send('Server error');
    }
};