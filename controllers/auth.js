const User = require('../models/user');
const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');

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
        
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};



exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Validate password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // User authenticated, can set up a session or token for authentication

        res.status(200).json({ message: 'Login successful' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

