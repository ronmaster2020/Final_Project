const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/user');
const Cart = require('../models/cart');

// Middleware to protect routes
const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).send('You need to log in first');
};

// Login route
router.post('/login', passport.authenticate('local', {
    successRedirect: '/auth/success',
    failureRedirect: '/auth/failure'
}));

// Register route
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, bio, address, access, phoneNumber, email, password } = req.body;

        const newCart = new Cart();
        await newCart.save();

        const cartId = newCart._id;
        const user = new User({ firstName, lastName, bio, address, access, phoneNumber, email, cartId });
        await user.setPassword(password);
        await user.save();

        res.status(201).send('User registered successfully!');
    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).send('Server error');
    }
});

// Logout route
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Error logging out:', err);
            return res.status(500).send('Server error');
        }
        res.status(200).send('Logged out successfully!');
    });
});

// Protected route example
router.get('/profile', ensureAuthenticated, (req, res) => {
    res.json(req.user);
});

// Login success handler
router.get('/success', (req, res) => {
    res.status(200).send('Logged in successfully!');
});

// Login failure handler
router.get('/failure', (req, res) => {
    res.status(401).send('Failed to log in.');
});

module.exports = router;
