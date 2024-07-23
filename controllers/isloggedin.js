const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        req.session.userId = req.user._id;
        req.userId = req.user._id;
        return next();
    }
    
    req.session.userId = null;
    req.flash('error', 'Please log in to view this resource');
    res.redirect('/login');
};

const ensureAccess = (req, res, next) => {
    if (req.isAuthenticated()) {
        if (req.user.access === 'admin' || req.user.access === 'staff') {
            return next();
        } else {
            req.flash('error', 'Access denied');
            return res.redirect('/');
        }
    }
    
    req.session.userId = null;
    req.flash('error', 'Please log in to view this resource');
    res.redirect('/login');
};

const getUserId = (req, res) => {
    if (req.isAuthenticated()) {
        const userId = req.user._id;
        console.log("User ID:", userId);
        res.json({ userId, cartId });
    } else {
        res.status(401).json({ error: 'User is not authenticated' });
    }
};


// Admin validation middleware
// const validateAdmin = (req, res, next) => {
//     if (req.user && req.user.isAdmin) {
//         next();
//     } else {
//         res.status(403).send('Access denied');
//     }
// };

module.exports = { ensureAuthenticated, ensureAccess, getUserId/*, validateAdmin*/ };
