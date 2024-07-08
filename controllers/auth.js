const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/user');
const Cart = require('../models/cart');
const { ObjectId } = require('mongodb');
const router = express.Router();

// Passport Local Strategy
passport.use(new LocalStrategy(
  { usernameField: 'email' }, // Specify that the username field is 'email'
  async function(username, password, done) {
    try {
      const user = await User.findOne({ email: username });
      if (!user) {
        return done(null, false, { message: 'Incorrect email.' });
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Registration Route
router.post('/register', async (req, res) => {
  const { firstName, lastName, bio, address, access, phoneNumber, email, password } = req.body;

  console.log('Registration request received:', req.body);

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('Email already registered:', email);
      return res.status(400).json({ message: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newCartId = new ObjectId();

    const user = new User({
      firstName,
      lastName,
      bio,
      address,
      access,
      phoneNumber,
      email,
      password: hashedPassword,
      cartId: newCartId,
      orders: [],
    });

    const savedUser = await user.save();
    console.log('User saved:', savedUser);

    const newCart = new Cart({
      _id: newCartId,
      products: [],
    });

    const savedCart = await newCart.save();
    console.log('Cart saved:', savedCart);

    req.session.cartId = newCartId;
    req.session.isLogedIn = true;

    res.status(201).json({ message: 'User registered successfully', user: savedUser, cart: savedCart });
  } catch (err) {
    console.error('Error in registration:', err);
    res.status(500).json({ error: err.message });
  }
});


// Login Route using Passport.js
router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(400).send('Invalid email or password');
      req.logIn(user, (err) => {
        if (err) return next(err);
        req.session.userId = user._id;
        res.status(200).send('Login successful!');
      });
    })(req, res, next);
  });
  
  module.exports = router;
