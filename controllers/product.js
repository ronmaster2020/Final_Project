const mongoose = require('mongoose');
const Product = require('../models/product');
const fs = require('fs');

// Check if the database is connected
const isDbConnected = () => mongoose.connection.readyState === 1;

// Create a new product
exports.createProduct = async (req, res) => {
    if (!isDbConnected()) {
        return res.status(503).send('Service unavailable. Please try again later.');
    }

    try {
        const imagePaths = req.files.map(file => file.path.replace(/\\/g, '/').replace('file_uploads/', ''));
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
            const messages = Object.values(err.errors).map(val => val.message);
            res.status(400).send({ errors: messages });
        } else {
            console.error('Error creating product:', err);
            res.status(500).send('Internal server error');
        }
    }
};

// Get all products
exports.getProducts = async (req, res) => {
    if (!isDbConnected()) {
        return res.status(503).send('Service unavailable. Please try again later.');
    }

    try {
        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) ? parseInt(req.query.limit, 10) : Number.MAX_SAFE_INTEGER;
        const skip = (page - 1) * limit;

        const products = await Product.find().sort({ name: 1 }).skip(skip).limit(limit);
        res.json(products);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).send('Internal server error');
    }
};

// Get a single product by ID
exports.getProductById = async (req, res) => {
    if (!isDbConnected()) {
        return res.status(503).send('Service unavailable. Please try again later.');
    }

    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send('Product not found');
        }
        res.json(product);
    } catch (err) {
        console.error('Error fetching product by ID:', err);
        res.status(500).send('Internal server error');
    }
};

// Update a product by ID
exports.updateProduct = async (req, res) => {
    if (!isDbConnected()) {
        return res.status(503).send('Service unavailable. Please try again later.');
    }

    try {
        const { name, DESC, price, gender, size } = req.body;
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
    } catch (err) {
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            res.status(400).send({ errors: messages });
        } else {
            console.error('Error updating product:', err);
            res.status(500).send('Internal server error');
        }
    }
};

// Delete a product by ID
exports.deleteProduct = async (req, res) => {
    if (!isDbConnected()) {
        return res.status(503).send('Service unavailable. Please try again later.');
    }

    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send('Product not found');
        }

        for (const imagePath of product.images) {
            fs.unlink(imagePath, (err) => {
                if (err) {
                    console.error('Error deleting product image:', err);
                }
            });
        }

        await Product.deleteOne({ _id: req.params.id });
        res.json({
            message: 'Product deleted successfully',
            product: product
        });
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).send('Internal server error');
    }
};

exports.searchProducts = async (req, res) => {
    const query = {};

    // Construct query object based on provided parameters
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

    // Construct sort object based on provided parameters
    let sortOptions = {};
    if (req.query.sort === 'name_asc') {
        sortOptions.name = 1; // ascending
    } else if (req.query.sort === 'name_desc') {
        sortOptions.name = -1; // descending
    } else if (req.query.sort === 'price_asc') {
        sortOptions.price = 1; // ascending
    } else if (req.query.sort === 'price_desc') {
        sortOptions.price = -1; // descending
    } else {
        sortOptions.name = 1; // default sorting by name ascending
    }
    try {
        if (!isDbConnected()) {
            return res.status(503).send('Service unavailable. Please try again later.');
        }

        const query = {};

        if (req.query.name) {
            const name = req.query.name.substring(0, 100);
            query.name = { $regex: new RegExp(`^${name}`), $options: 'i' };
        }

        if (req.query.priceMin && req.query.priceMax && !isNaN(req.query.priceMin) && !isNaN(req.query.priceMax)) {
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

        if (req.query.gender) {
            query.gender = req.query.gender;
        }

        if (req.query.sizeMin && req.query.sizeMax && !isNaN(req.query.sizeMin) && !isNaN(req.query.sizeMax)) {
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

        if (req.query.stockMin && req.query.stockMax && !isNaN(req.query.stockMin) && !isNaN(req.query.stockMax)) {
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

        // Construct sort object based on provided parameters
        let sortOptions = {};
        if (req.query.sort) {
            switch (req.query.sort) {
                case 'name_asc':
                    sortOptions.name = 1; // ascending
                    break;
                case 'name_desc':
                    sortOptions.name = -1; // descending
                    break;
                case 'price_asc':
                    sortOptions.price = 1; // ascending
                    break;
                case 'price_desc':
                    sortOptions.price = -1; // descending
                    break;
                default:
                    sortOptions.price = 1; // default sorting by price ascending
                    break;
            }
        }

        try {
            // Pagination
            const page = parseInt(req.query.page, 10) || 1;
            const limit = parseInt(req.query.limit, 10) || Number.MAX_SAFE_INTEGER;
            const skip = (page - 1) * limit;

            const totalProducts = await Product.find(query).countDocuments();
            const products = await Product.find(query).limit(limit).skip(skip).sort(sortOptions);
            res.status(200).json({ products, totalProducts });
        } catch (err) {
            console.error('Error searching products:', err);
            res.status(500).send('Internal server error');
        }
    } catch (err) {
        console.error('Error searching products:', err);
        res.status(500).send('Internal server error');
    }
}