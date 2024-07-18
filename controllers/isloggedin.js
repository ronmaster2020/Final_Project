const User = require('../models/user');
const Cart = require('../models/cart');

const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        req.session.userId = req.user._id;
        req.session.isLoggedIn = true;
        return next();
    }
    req.flash('error', 'Please log in to view this resource');
    res.redirect('/login');
};

const isLoggedIn = async (req, res, next) => {
    if (req.isAuthenticated()) {
        req.session.userId = req.user._id;
        req.session.isLoggedIn = true;

        try {
            const cart = await Cart.findOne({ userId: req.user._id }).populate('products.productId');
            req.session.cart = cart;
            next();
        } catch (err) {
            console.error('Error fetching cart items:', err);
            req.flash('error', 'Error fetching cart items');
            res.redirect('/');
        }
    } else {
        req.session.userId = null;
        req.session.isLoggedIn = false;
        next();
    }
};

const getUserAndCartId = (req, res) => {
    if (req.isAuthenticated()) {
        const userId = req.user._id;
        const cartId = req.session.cart ? req.session.cart._id : null;
        res.json({ userId, cartId });
    } else {
        res.status(401).json({ error: 'User is not authenticated' });
    }
};

module.exports = { ensureAuthenticated, isLoggedIn, getUserAndCartId };
