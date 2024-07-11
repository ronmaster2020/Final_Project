const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const authRoutes = require('./controllers/auth');
const productController = require('./controllers/product');
const orderController = require('./controllers/order');
const cartController = require('./controllers/cart');
const SettingsController = require('./controllers/SettingsController');
const PORT = process.env.PORT || 8080;

const app = express();

// Load passport configuration
require('./controllers/passport');

// MongoDB connection
mongoose.connect('mongodb+srv://mike:cIBBf4X6JasSW8oK@cluster0.emzh3yv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => {
        console.log('MongoDB connected');
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });

// Session configuration
app.use(session({
    secret: '0802',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: 'mongodb+srv://mike:cIBBf4X6JasSW8oK@cluster0.emzh3yv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0' })
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/products_files', express.static(path.join(__dirname, 'file_uploads', 'products_files')));
app.use('/partials', express.static(path.join(__dirname, 'views/partials')));

// Middleware to ensure user is authenticated
const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).send('You need to log in first');
};

// Auth routes
app.use('/auth', authRoutes);

// Route for checking cart status
app.get('/api/cart', ensureAuthenticated, cartController.getCartStatus);

// Protected route example
app.get('/dashboard', ensureAuthenticated, (req, res) => {
    res.json({
        message: 'Welcome to your dashboard',
        user: req.user
    });
});

// Configure storage options
const product_file_storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './file_uploads/products_files');
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}.${file.originalname}`);
    }
});

const product_file_upload = multer({ storage: product_file_storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Routes for serving pages
const servePage = (page) => (req, res) => res.sendFile(path.join(__dirname, 'views', page));
app.get('/', servePage('index.html'));
app.get('/about', servePage('about.html'));
app.get('/contact', servePage('contact.html'));
app.get('/admin', servePage('admin.html'));
app.get('/admin/dashboard', servePage('admin_dashboard.html'));
app.get('/admin/products', servePage('admin_products.html'));
app.get('/admin/orders', servePage('admin_orders.html'));
app.get('/admin/staff', servePage('admin_staff.html'));
app.get('/admin/settings', servePage('admin_settings.html'));
app.get('/orderhistory', servePage('orderHistory.html'));
app.get('/product/new-form', servePage('productForm.html'));
app.get('/viewCart', servePage('cart.html'));
app.get('/emptyCart', servePage('emptyCart.html'));
app.get('/userpage', servePage('userpage.html'));
app.get('/register', servePage('register.html'));
app.get('/login', servePage('login.html'));

// Routes for products (CRUD)
app.post('/product/create', product_file_upload.array('productImage', 10), productController.createProduct);
app.get('/product/all', productController.getProducts);
app.get('/products/search', productController.searchProducts);
app.post('/product/update/:id', productController.updateProduct);
app.post('/product/delete/:id', productController.deleteProduct);
app.get('/product/:id', productController.getProductById);

// Routes for orders (CRUD)
app.post('/order/create', orderController.createOrder);
app.get('/order/all', orderController.getOrders);
app.get('/order/:id', orderController.getOrderById);

// Routes for cart (CRUD)
app.post('/cart/create', cartController.createCart);
app.post('/cart/add/:productId', cartController.AddToCart);
app.get('/cart/all', cartController.getAllCarts);
app.post('/cart/delete', cartController.deleteCart);
app.post('/cart/delproduct', cartController.deleteProductFromCart);
app.post('/cart/deleteAllProducts', cartController.deleteAllProductsFromCart);

// Routes for SettingsController
app.get('/getUserDetails/:id', SettingsController.getUserDetails);
app.post('/settings', SettingsController.updateUserSettings);
app.post('/updateUser/:id', SettingsController.updateUser);
app.get('/username/:id', SettingsController.getUserName);
app.get('/getAccessLevel/:id', SettingsController.getAccessLevel);
app.post('/updateAccessLevel/:id', SettingsController.updateAccessLevel);

// Catch-all route for any other requests
app.use('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', '404.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

function validateAdmin(req, res, next) {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403).send('Access denied');
    }
}
