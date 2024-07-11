const express = require("express"),
    User = require("../models/user"),
    passport = require('passport'),
    router = express.Router();

router.get('/login', async (req, res) => {
    res.render('login', { currentPage: 'login' });
})

router.get('/login', (req, res) => {
    res.render('login', { currentPage: 'login' });
});
router.get('/googleLogin', (req, res) => {
    res.render('googleLogin', { currentPage: 'googleLogin' });
});


router.post('/register', async (req, res) => {
    let user
    try {
        user = await User.register(req.body, req.body.password);
    } catch (e) {
        console.log("error in create user: " + e);
        return res.status(500).send('A user with the given username is already registered.');
    }
    req.logIn(user, async (err) => {
        if (err) return next(err);
        return res.redirect('/artifacts');
    });
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', function (err, user, info) {
        if (err) {
            console.error('Authentication error:', err);
            return res.status(500).send('Internal Server Error');
        }

        if (!user) {
            // No user found, handle based on info
            if (info && (info.name === 'IncorrectPasswordError' || info.name === 'IncorrectUsernameError')) {
                return res.status(401).send('Incorrect username or password');
            } else {
                return res.status(401).send('User not found');
            }
        }

        // User authenticated, log them in
        req.logIn(user, async function (err) {
            if (err) {
                console.error('Login error:', err);
                return res.status(500).send('Internal Server Error');
            }
            // Redirect user after successful login
            return res.redirect('/artifacts');
        });

    })(req, res, next);
});


router.get('/logout', (req, res) => {
    req.logOut(() => {
        res.redirect('/auth');
    });
});

router.get('/', (req, res) => {
    res.locals.currentPage = 'login';
    res.render('login');
})


module.exports = router;