const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const app = express();
const PORT = process.env.PORT || 8080;

const Cart = require('./models/cart');
const User = require('./models/user');

// Middleware to check DB connection
const checkDBConnection = (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).send('Service unavailable. Please try again later.');
    }
    next();
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/products_files', express.static(path.join(__dirname, 'file_uploads', 'products_files')));
app.use('/partials', express.static(path.join(__dirname, 'views', 'partials')));

app.use(session({
    secret: '0802',
    resave: false,
    saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    if (req.user) {
        req.session.userId = req.user._id;
        req.session.isLoggedIn = true;
    } else {
        req.session.userId = null;
        req.session.isLoggedIn = false;
    }

    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');

    next();
});

const { ensureAuthenticated, isLoggedIn } = require('./controllers/isloggedin');

mongoose.connect('mongodb+srv://mike:cIBBf4X6JasSW8oK@cluster0.emzh3yv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => {
        console.log('MongoDB connected');
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });

const product_file_storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './file_uploads/products_files');
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}.${file.originalname}`);
    }
});

const product_file_upload = multer({ storage: product_file_storage, limits: { fileSize: 10 * 1024 * 1024 } });

const isloggedin = require('./controllers/isloggedin');

app.get('/api/useId', ensureAuthenticated, isloggedin.getUserAndCartId);


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/products', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'viewproducts.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'contact.html'));
});

app.get('/leadership', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'leadership.html'));
});

app.get('/privacy', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'privacy.html'));
});

app.get('/terms', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'terms.html'));
});

app.get('/admin', ensureAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

app.get('/admin/dashboard', ensureAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin_dashboard.html'));
});

app.get('/admin/products', ensureAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin_products.html'));
});

app.get('/admin/orders', ensureAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin_orders.html'));
});

app.get('/admin/staff', ensureAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin_staff.html'));
});

app.get('/admin/settings', ensureAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin_settings.html'));
});

app.get('/orderhistory', ensureAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'orderHistory.html'));
});


app.get('/product/new-form', ensureAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'productForm.html'));
});

app.get('/viewCart', ensureAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'cart.html'));
});

app.get('/emptyCart', ensureAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'emptyCart.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/userpage', ensureAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'userpage.html'));
});

// Authentication Routes
const authController = require('./controllers/auth');
app.post('/register', authController.register);
app.post('/login', authController.login);
app.get('/logout', authController.logout);
app.get('/user/all', authController.getUsers);
app.get('/user/search', authController.searchUsers);

// Product Routes
const productController = require('./controllers/product');
app.post('/product/create', ensureAuthenticated, product_file_upload.array('productImage', 10), productController.createProduct);
app.get('/product/all', productController.getProducts);
app.get('/products/search', productController.searchProducts);
app.post('/product/update/:id', ensureAuthenticated, productController.updateProduct);
app.post('/product/delete/:id', ensureAuthenticated, productController.deleteProduct);
app.get('/product/:id', productController.getProductById);

// Order Routes
const orderController = require('./controllers/order');
app.post('/order/create', ensureAuthenticated, orderController.createOrder);
app.get('/order/all', ensureAuthenticated, orderController.getOrders);
app.get('/order/:id', ensureAuthenticated, orderController.getOrderById);
app.get('/order/grouped/date', ensureAuthenticated, orderController.getOrdersGroupByDate);
app.post('/order/delete/:id', ensureAuthenticated, orderController.deleteOrder);
app.get('/orders/byid/:userId', ensureAuthenticated, orderController.getOrdersByUserId);

// Cart Routes
const cartController = require('./controllers/cart');
app.post('/cart/create', ensureAuthenticated, cartController.createCart);
app.post('/cart/add/:productId', ensureAuthenticated, cartController.addToCart);
app.get('/cart/:userId', ensureAuthenticated, cartController.getCart);
app.post('/cart/update/:id', ensureAuthenticated, cartController.updateCart);
app.post('/cart/delete/:id', ensureAuthenticated, cartController.deleteCart);
app.get('/cart/all', ensureAuthenticated, cartController.getAllCarts);
app.get('/cartById/:cartId', ensureAuthenticated, cartController.getCartById);

app.get('/api/cart', ensureAuthenticated, async (req, res) => {
    console.log('Request received at /cart');
    try {
        const cart = await Cart.findOne({ userId: req.user._id }).populate('products.productId');
        if (!cart) {
            return res.status(404).json({ error: 'No cart found' });
        }
        res.json({ cartId: cart._id, isLoggedIn: req.session.isLoggedIn, cart }); // Ensure these properties are returned
    } catch (err) {
        console.error('Error fetching cart:', err);
        res.status(500).json({ error: 'Error fetching cart' });
    }
});

// Settings Routes
const settingsController = require('./controllers/SettingsController');
app.get('/getUserDetails/:id', settingsController.getUserDetails);
app.post('/settings', settingsController.updateUserSettings);
app.post('/updateUser/:id', settingsController.updateUser);
app.get('/username/:id', settingsController.getUserName);
app.get('/getAccessLevel/:id', settingsController.getAccessLevel);
app.post('/updateAccessLevel/:id', settingsController.updateAccessLevel);

// Catch-all route for any other requests
app.use('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', '404.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Admin validation middleware
function validateAdmin(req, res, next) {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403).send('Access denied');
    }
}

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
