require('dotenv').config();

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/user');
const Cart = require('../models/cart');
const mongoose = require('mongoose');

console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET);

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

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
}, async (token, tokenSecret, profile, done) => {
    try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
            const newCart = new Cart({ products: [] });
            await newCart.save();

            user = new User({
                googleId: profile.id,
                email: profile.emails[0].value,
                firstName: profile.displayName,
                access: 'user',
                cartId: newCart._id
            });
            await user.save();
        }
        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

// Google Authentication
const googleAuth = (req, res, next) => {
    passport.authenticate('google', { 
        scope: ['profile', 'email'],
        callbackURL: 'http://localhost:8080/auth/google/callback' })(req, res, next);
};
const googleAuthCallback = (req, res, next) => {
    passport.authenticate('google', { 
        failureRedirect: '/login',
        callbackURL: 'http://localhost:8080/auth/google/callback' }, async (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            req.flash('error', info.message);
            return res.status(401).json({ message: 'Incorrect email or password'});
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
                req.session.userId = user._id;
                req.flash('success', 'You are now logged in!');
                if (user.access === 'admin' || user.access === 'staff') {
                    return res.status(200).redirect('/admin/dashboard');
                } else {
                    return res.status(200).redirect('/userpage.html');
                }
            } catch (err) {
                console.error('Error fetching cart items:', err);
                req.flash('error', 'Error fetching cart items');
                return res.status(500).json({ message: 'Server error'});
            }
        });
    })(req, res, next);
};

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
            return res.status(401).json({ message: 'Incorrect email or password'});
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
                req.session.userId = user._id;
                req.flash('success', 'You are now logged in!');
                if (user.access === 'admin' || user.access === 'staff') {
                    return res.status(200).redirect('/admin/dashboard');
                } else {
                    return res.status(200).redirect('/userpage.html');
                }
            } catch (err) {
                console.error('Error fetching cart items:', err);
                req.flash('error', 'Error fetching cart items');
                return res.status(500).json({ message: 'Server error'});
            }
        });
    })(req, res, next);
};

const register = async (req, res) => {
    const { firstName, lastName, bio, address, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            req.flash('error', 'Email already in use');
            return res.status(400).json({ message: 'Email already in use'});
        } else if (password.length < 8) {
            req.flash('error', 'Password must be at least 8 characters');
            return res.status(400).json({ message: 'Password must be at least 8 characters'});
        } else {
            console.log('regisration:')
            console.log('Password', password);
            console.log('userEmail', email);
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newCart = new Cart({ products: [] });
        await newCart.save();

        const newUser = new User({ firstName, lastName, bio, address, access: 'user', email, password: hashedPassword, cartId: newCart._id });
        
        await newUser.save();

        if (!newUser) {
            req.flash('error', 'Error creating user');
            return res.status(500).json({ message: 'Error creating user'});
        }

        req.session.userId = newUser._id;
        req.flash('success', 'You are now registered and can log in!');
        res.status(201).redirect('/userpage.html');
    } catch (err) {
        console.error('Error creating user:', err);
        req.flash('error', 'Error creating user');
        res.status(500).json({ message: 'Server error'});
    }
};

const logout = (req, res) => {
    try {
        req.logout((err) => {
            if (err) {
                return next(err);
            }
            req.flash('success', 'You are logged out');
            res.status(200).redirect('/');
        });
    } catch (err) {
        console.error('Error logging out:', err);
        req.flash('error', 'Error logging out');
        res.status(500).json({ message: 'Server error'});
    }
};


const getUsers = async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ message: 'Service unavailable. Please try again later.'});
    }

    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (err) {
        console.error('Error getting users:', err);
        res.status(500).json({ message: 'Server error'});
    }
};

const searchUsers = async (req, res) => {
    const query = {};

    if (req.query.firstName && req.query.firstName.length > 0) {
        query.firstName = { $regex: new RegExp(`^${req.query.firstName.substring(0, 100)}`), $options: 'i' };
    }

    if (req.query.lastName && req.query.lastName.length > 0) {
        query.lastName = { $regex: new RegExp(`^${req.query.lastName.substring(0, 100)}`), $options: 'i' };
    }

    if (req.query.bio && req.query.bio.length > 0) {
        query.bio = { $regex: new RegExp(`^${req.query.bio.substring(0, 100)}`), $options: 'i' };
    }

    if (req.query.address && req.query.address.length > 0) {
        query.address = { $regex: new RegExp(`^${req.query.address.substring(0, 100)}`), $options: 'i' };
    }

    if (req.query.access && req.query.access === 'admin' || req.query.access === 'staff' || req.query.access === 'user') {
        query.access = req.query.access;
    }

    if (req.query.email && req.query.email.length > 0) {
        query.email = { $regex: new RegExp(`^${req.query.email.substring(0, 100)}`), $options: 'i' };
    }

    if (req.query.cartId && req.query.cartId.length > 0) {
        query.cartId = { $regex: new RegExp(`^${req.query.cartId.substring(0, 100)}`), $options: 'i' };
    }

    if (req.query.googleId && req.query.googleId.length > 0) {
        query.googleId = { $regex: new RegExp(`^${req.query.googleId.substring(0, 100)}`), $options: 'i' };
    }

    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || Number.MAX_SAFE_INTEGER;
        const skip = (page - 1) * limit;

        const totalUsers = await User.countDocuments(query);
        
        const users = await User.find(query).skip(skip).limit(limit);
        res.status(200).json({users, totalUsers});
    } catch (err) {
        console.error('Error searching users:', err);
        res.status(500).json({ message: 'Server error'});
    }
};

module.exports = { googleAuth, googleAuthCallback, login, register, logout, getUsers, searchUsers };
