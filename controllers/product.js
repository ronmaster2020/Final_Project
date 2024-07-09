const mongoose = require('mongoose');
const Product = require('../models/product');
const fs = require('fs');

// Create a new product
exports.createProduct = async (req, res) => {
    // Check if the database is connected
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).send('Service unavailable. Please try again later.');
    }

    try {
        // Extract file paths from the uploaded files
        const imagePaths = req.files.map(file => file.path.replace(/\\/g, '/').replace('file_uploads/', ''));        // Extract the product data from the request body
        const { name, DESC, price, gender, size, stock } = req.body;
        const newProduct = new Product({
            name,
            DESC,
            price,
            gender,
            size,
            stock,
            images: imagePaths
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
        const { name, price, gender, size, DESC } = req.body;
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send('Product not found');
        }
        product.name = name;
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
        // Delete the product images from the file system
        for (const imagePath of product.images) {
            fs.unlink(imagePath, (err) => {
                if (err) {
                    console.error('Error deleting product image:', err);
                }
            });
        }
        await Product.deleteOne( { _id: `${req.params.id}` } );
        res.json({
            message: 'Product deleted successfully',
            product: product
        });
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).send('Server error');
    }
};

// Search for products by attributes (f-letter, price, gender, size)
exports.searchProducts = async (req, res) => {
    const query = {};

    if (req.query.name) {
        const name = req.query.name.substring(0, 100); // Limit to 100 characters
        query.name = { $regex: new RegExp(`^${name}`), $options: 'i' }; // Case-insensitive
    }
    
    if (req.query.priceMin && req.query.priceMax && !isNaN(req.query.priceMax) && !isNaN(req.query.priceMin)){
        const minPrice = parseInt(req.query.priceMin, 10);
        const maxPrice = parseInt(req.query.priceMax, 10);
        query.price = { $gte: minPrice, $lte: maxPrice };
    } else if (req.query.priceMin && !isNaN(req.query.priceMin)) {
        const minPrice = parseInt(req.query.priceMin, 10);
        query.price = { $gte: minPrice };
    } else if (req.query.priceMax && !isNaN(req.query.priceMax)) {
        const maxPrice = parseInt(req.query.priceMax, 10);
        query.price = { $lte: maxPrice };
    }

    if (req.query.gender && !isNaN(req.query.gender)) {
        const genderCategory = parseInt(req.query.gender, 10); // Convert to number
        query.gender = genderCategory;
    }
    
    if (req.query.sizeMin && req.query.sizeMax && !isNaN(req.query.sizeMin) && !isNaN(req.query.sizeMax)){
        const minSize = parseInt(req.query.sizeMin, 10);
        const maxSize = parseInt(req.query.sizeMax, 10);
        query.size = { $gte: minSize, $lte: maxSize };
    } else if (req.query.sizeMin && !isNaN(req.query.sizeMin)) {
        const minSize = parseInt(req.query.sizeMin, 10);
        query.size = { $gte: minSize };
    } else if (req.query.sizeMax && !isNaN(req.query.sizeMax)) {
        const maxSize = parseInt(req.query.sizeMax, 10);
        query.size = { $lte: maxSize };
    }

    if (req.query.stockMin && req.query.stockMax && !isNaN(req.query.stockMin) && !isNaN(req.query.stockMax)){
        const minStock = parseInt(req.query.stockMin, 10);
        const maxStock = parseInt(req.query.stockMax, 10);
        query.stock = { $gte: minStock, $lte: maxStock };
    } else if (req.query.stockMin && !isNaN(req.query.stockMin)) {
        const minStock = parseInt(req.query.stockMin, 10);
        query.stock = { $gte: minStock };
    } else if (req.query.stockMax && !isNaN(req.query.stockMax)) {
        const maxStock = parseInt(req.query.stockMax, 10);
        query.stock = { $lte: maxStock };
    }

    try {
        const products = await Product.find(query);
        res.json(products);
    } catch (err) {
        console.error('Error searching products:', err);
        res.status(500).send('Server error');
    }
};