const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/user');
const Cart = require('../models/cart');
const mongoose = require('mongoose');

passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return done(null, false, { message: 'Incorrect email.' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            return done(null, user);
        } else {
            return done(null, false, { message: 'Incorrect password.' });
        }
    } catch (err) {
        return done(err);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

const login = (req, res, next) => {
    passport.authenticate('local', async (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            req.flash('error', info.message);
            return res.redirect('/login');
        }
        req.logIn(user, async (err) => {
            if (err) {
                return next(err);
            }
            try {
                let cart = await Cart.findOne({ _id: user.cartId }).populate('products.productId');
                if (!cart) {
                    cart = new Cart({ products: [] });
                    await cart.save();
                    user.cartId = cart._id;
                    await user.save();
                }
                req.session.cart = cart;
                req.flash('success', 'You are now logged in!');
                return res.redirect('/');
            } catch (err) {
                console.error('Error fetching cart items:', err);
                req.flash('error', 'Error fetching cart items');
                return res.redirect('/');
            }
        });
    })(req, res, next);
};


const register = async (req, res) => {
    const { firstName, lastName, bio, address, access, phoneNumber, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            req.flash('error', 'Email already in use');
            return res.redirect('/register');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newCart = new Cart({ products: [] });
        await newCart.save();

        const newUser = new User({ firstName, lastName, bio, address, access, phoneNumber, email, password: hashedPassword, cartId: newCart._id });
        
        await newUser.save();

        req.flash('success', 'You are now registered and can log in!');
        res.redirect('/login');
    } catch (err) {
        console.error('Error creating user:', err);
        req.flash('error', 'Error creating user');
        res.redirect('/register');
    }
};

const logout = (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash('success', 'You are logged out');
        res.redirect('/login');
    });
};


const getUsers = async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).send('Service unavailable. Please try again later.');
    }

    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        console.error('Error getting users:', err);
        res.status(500).send('Server error');
    }
};

const searchUsers = async (req, res) => {
    const query = req.query || {};

    if (req.query.firstName) {
        query.firstName = { $regex: new RegExp(`^${req.query.firstName.substring(0, 100)}`), $options: 'i' };
    }

    if (req.query.lastName) {
        query.lastName = { $regex: new RegExp(`^${req.query.lastName.substring(0, 100)}`), $options: 'i' };
    }

    if (req.query.bio) {
        query.bio = { $regex: new RegExp(`^${req.query.bio.substring(0, 100)}`), $options: 'i' };
    }

    if (req.query.address) {
        query.address = { $regex: new RegExp(`^${req.query.address.substring(0, 100)}`), $options: 'i' };
    }

    if (req.query.access) {
        query.access = { $regex: new RegExp(`^${req.query.access.substring(0, 100)}`), $options: 'i' };
    }

    if (req.query.phoneNumber) {
        query.phoneNumber = { $regex: new RegExp(`^${req.query.phoneNumber.substring(0, 100)}`), $options: 'i' };
    }

    if (req.query.email) {
        query.email = { $regex: new RegExp(`^${req.query.email.substring(0, 100)}`), $options: 'i' };
    }

    if (req.query.cartId) {
        query.cartId = { $regex: new RegExp(`^${req.query.cartId.substring(0, 100)}`), $options: 'i' };
    }

    try {
        const users = await User.find(query);
        res.json(users);
    } catch (err) {
        console.error('Error searching users:', err);
        res.status(500).send('Server error');
    }
};

module.exports = { login, register, logout, getUsers, searchUsers };
