const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/user');
const Cart = require('../models/cart');

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
                const cart = await Cart.findOne({ userId: user._id }).populate('products.productId');
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
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ firstName, lastName, bio, address, access, phoneNumber, email, password: hashedPassword });
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

module.exports = { login, register, logout };
