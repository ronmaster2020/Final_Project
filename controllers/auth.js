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

        const orders = [];
        
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
            orders: orders,
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

