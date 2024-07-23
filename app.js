const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const app = express();
const PORT = process.env.PORT || 8080;

const { ensureAuthenticated, ensureAccess, getUserId } = require('./controllers/isloggedin');

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
    } else {
        req.session.userId = null;
    }

    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');

    next();
});

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

app.get('/api/userId', ensureAuthenticated, isloggedin.getUserId); // Place this route before the catch-all


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

app.get('/admin/dashboard', ensureAuthenticated, ensureAccess, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin_dashboard.html'));
});

app.get('/admin/products', ensureAuthenticated, ensureAccess, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin_products.html'));
});

app.get('/admin/orders', ensureAuthenticated, ensureAccess, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin_orders.html'));
});

app.get('/admin/staff', ensureAuthenticated, ensureAccess, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin_staff.html'));
});

app.get('/admin/settings', ensureAuthenticated, ensureAccess, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin_settings.html'));
});

app.get('/orderhistory', ensureAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'orderHistory.html'));
});

app.get('/product/new-form', ensureAuthenticated, ensureAccess, (req, res) => {
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
app.post('/product/create', ensureAuthenticated, ensureAccess, product_file_upload.array('productImage', 10), productController.createProduct);
app.get('/product/all', productController.getProducts);
app.get('/products/search', productController.searchProducts);
app.post('/product/update/:id', ensureAuthenticated, ensureAccess, productController.updateProduct);
app.post('/product/delete/:id', ensureAuthenticated, ensureAccess, productController.deleteProduct);
app.get('/product/:id', productController.getProductById);

// Order Routes
const orderController = require('./controllers/order');
app.post('/order/create', ensureAuthenticated, orderController.createOrder);
app.get('/order/all', ensureAuthenticated, ensureAccess, orderController.getOrders);
app.get('/order/grouped/date', ensureAuthenticated, ensureAccess, orderController.getOrdersGroupByDate);
app.post('/order/delete/:id', ensureAuthenticated, ensureAccess, orderController.deleteOrder);
app.get('/orders/history', ensureAuthenticated, orderController.getOrdersByUserId);
app.get('/order/:id', ensureAuthenticated, orderController.getOrderById);

// Cart Routes
const cartController = require('./controllers/cart');
app.post('/cart/create', ensureAuthenticated, cartController.createCart);
app.post('/cart/add/:productId/:quantity', ensureAuthenticated, cartController.addToCart);
app.get('/getCart', ensureAuthenticated, cartController.getCart);
app.post('/cart/update', ensureAuthenticated, cartController.updateCart);
app.post('/cart/delete', ensureAuthenticated, cartController.deleteCart);
app.get('/cart/all', ensureAuthenticated, ensureAccess, cartController.getAllCarts);

// Settings Routes
const settingsController = require('./controllers/SettingsController');
app.get('/getUserDetails', ensureAuthenticated, settingsController.getUserDetails);
app.post('/settings', ensureAuthenticated, settingsController.updateUserSettings);
app.post('/updateUser', ensureAuthenticated, settingsController.updateUser);
app.get('/username', ensureAuthenticated, settingsController.getUserName);
app.get('/getAccessLevel', ensureAuthenticated, settingsController.getAccessLevel);
app.post('/updateAccessLevel', ensureAuthenticated, settingsController.updateAccessLevel);

// Catch-all route for any other requests
app.use('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', '404.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
