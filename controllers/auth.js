const mongoose = require('mongoose');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');
const Cart = require('../models/cart');
const globalState = require('../globalState'); // Import global state

exports.register = async (req, res) => {
    const { firstName, lastName, bio, address, access, phoneNumber, email, password } = req.body;
    
    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds
        const newCartId = new ObjectId();
        
        // Create a new user instance with hashed password
        const user = new User({ 
            firstName, 
            lastName, 
            bio, 
            address, 
            access, 
            phoneNumber, 
            email, 
            password: hashedPassword, // Store hashed password
            cartId: newCartId,
        });

        
        
        // Save the user to the database
        await user.save();

        // New empty cart
        const newCart = new Cart();
        newCart._id = newCartId;
        console.log(newCart._id);
        await newCart.save();

        globalState.cartId = newCartId; // Set global cartId
        globalState.isLogedIn = true;
        
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.login = async (req, res) => {
    const { email, password } = req.body;
    console.log('Received login request for email:', email); // Add logging
    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.error('User not found:', email);
            return res.status(404).json({ message: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.error('Invalid credentials for user:', email);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const cart = await Cart.findById(user.cartId);
        globalState.cartId = user.cartId; // Set global cartId
        globalState.isLogedIn = true;
        res.json({ message: 'Login successful!', user, cart, isLogedIn: globalState.isLogedIn });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.getUsers = async(req, res) => {
    // Check if the database is connected
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).send('Service unavailable. Please try again later.');
    }

    try {
        const users = await User.find();
        res.json(users);
        //console.log(carts);
        //return carts;
    } catch (err) {
        console.error('Error getting carts:', err);
        res.status(500).send('Server error');
    }
};

// Search for users by query parameters
exports.searchUsers = async (req, res) => {
    const query = req.query || {};

    if (req.query.firstName) {
        const firstName = req.query.firstName.substring(0, 100); // Limit to 100 characters
        query.firstName = { $regex: new RegExp(`^${firstName}`), $options: 'i' }; // Case-insensitive
    }

    if (req.query.lastName) {
        const lastName = req.query.lastName.substring(0, 100); // Limit to 100 characters
        query.lastName = { $regex: new RegExp(`^${lastName}`), $options: 'i' }; // Case-insensitive
    }

    if (req.query.bio) {
        const bio = req.query.bio.substring(0, 100); // Limit to 100 characters
        query.bio = { $regex: new RegExp(`^${bio}`), $options: 'i' }; // Case-insensitive
    }

    if (req.query.address) {
        const address = req.query.address.substring(0, 100); // Limit to 100 characters
        query.address = { $regex: new RegExp(`^${address}`), $options: 'i' }; // Case-insensitive
    }

    if (req.query.access) {
        const access = req.query.access.substring(0, 100); // Limit to 100 characters
        query.access = { $regex: new RegExp(`^${access}`), $options: 'i' }; // Case-insensitive
    }

    if (req.query.phoneNumber) {
        const phoneNumber = req.query.phoneNumber.substring(0, 100); // Limit to 100 characters
        query.phoneNumber = { $regex: new RegExp(`^${phoneNumber}`), $options: 'i' }; // Case-insensitive
    }

    if (req.query.email) {
        const email = req.query.email.substring(0, 100); // Limit to 100 characters
        query.email = { $regex: new RegExp(`^${email}`), $options: 'i' }; // Case-insensitive
    }

    if (req.query.cartId) {
        const cartId = req.query.cartId.substring(0, 100); // Limit to 100 characters
        query.cartId = { $regex: new RegExp(`^${cartId}`), $options: 'i' }; // Case-insensitive
    }

    try {
        const users = await User.find(query);
        res.json(users);
    } catch (err) {
        console.error('Error searching users:', err);
        res.status(500).send('Server error');
    }
};