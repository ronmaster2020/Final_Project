const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const multer  = require('multer');
const upload = multer()
const app = express();
const globalState = require('./globalState'); // Import global state
const PORT = process.env.PORT || 8080;
app.use(express.json());
// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
app.use('/products_files', express.static(path.join(__dirname, 'file_uploads', 'products_files')));
app.use('/partials', express.static(__dirname + '/views/partials'));
app.use(express.urlencoded({ extended: true })); // Middleware to parse form data

// Middleware to parse JSON bodies
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb+srv://mike:cIBBf4X6JasSW8oK@cluster0.emzh3yv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
.then(() => {
    console.log('MongoDB connected');
})
.catch(err => {
    console.error('MongoDB connection error:', err);
});

// Configure storage options
const product_file_storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './file_uploads/products_files');
    },
    filename: function(req, file, cb) {
        cb(null, `${Date.now()}.${file.originalname}`); // Set the file name
    }
});

const product_file_upload = multer({ storage: product_file_storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10 MB file size limit

// Route for the sending pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'contact.html'));
});

app.get('/admin'/*, validateAdmin()*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

app.get('/admin/dashboard'/*, validateAdmin()*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin_dashboard.html'));
});

app.get('/admin/products'/*, validateAdmin()*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin_products.html'));
});

app.get('/admin/orders'/*, validateAdmin()*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin_orders.html'));
});

app.get('/admin/staff'/*, validateAdmin()*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin_staff.html'));
});

app.get('/admin/settings'/*, validateAdmin()*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin_settings.html'));
});

app.get('/orderhistory', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'orderHistory.html'));
});

// Route for the create product page
app.get('/product/new-form'/*, validateAdmin()*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'productForm.html'));
});

app.get('/viewCart', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'cart.html'));
});

app.get('/emptyCart', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'emptyCart.html'));
  });

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'register.html'));
});
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});
app.get('/userpage', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'userpage.html'));
});

// Route for user registration

const authController = require('./controllers/auth');

app.post('/register', authController.register);

app.post('/login', authController.login);

app.get('/user/all', authController.getUsers);



// all routes for products (CRUD)

const productController = require('./controllers/product');

app.post('/product/create'/*, validateAdmin()*/, product_file_upload.array('productImage', 10), productController.createProduct);

app.get('/product/all', productController.getProducts);

app.get('/products/search', productController.searchProducts);

app.post('/product/update/:id'/*, validateAdmin()*/, productController.updateProduct);

app.post('/product/delete/:id'/*, validateAdmin()*/, productController.deleteProduct);

app.get('/product/:id', productController.getProductById);



// all routes for orders (CRUD)

const orderController = require('./controllers/order');

app.post('/order/create', orderController.createOrder);

app.get('/order/all'/*, validateAdmin()*/, orderController.getOrders);

app.get('/order/:id', orderController.getOrderById);

app.post('/order/delete/:id', orderController.deleteOrder);

app.get('/orders/byid/:userId', orderController.getOrdersByUserId);

// all routes for cart (CRUD)

const cartController = require('./controllers/cart');

app.post('/cart/create', cartController.createCart);

app.post('/cart/add/:productId', cartController.AddToCart);

app.post('/cart/update', cartController.updateCart);

app.get('/cart/all'/*, validateAdmin()*/, cartController.getAllCarts);

app.post('/cart/delete', cartController.deleteCart);

app.get('/api/cart', (req, res) => {
    res.json({ cartId: globalState.cartId, isLogedIn: globalState.isLogedIn });
});

app.post('/cart/delproduct', cartController.deleteProductFromCart);

app.post('/cart/deleteAllProducts', cartController.deleteAllProductsFromCart);

// catch-all route for any other requests

//all of th routes f or settingsController
const  SettingsController  = require('./controllers/SettingsController'); 


// new func to replace all this stuff app.get('/getUserDetails/:id', SettingsController.getUserDetails);

app.get('/getUserDetails/:id', SettingsController.getUserDetails);


app.post('/settings',SettingsController.updateUserSettings);

app.post('/updateUser/:id',SettingsController.updateUser);
app.get('/username/:id',SettingsController.getUserName);
app.get('/getAccessLevel/:id', SettingsController.getAccessLevel);
app.post('/updateAccessLevel/:id', SettingsController.updateAccessLevel);

app.use('*', (request, response) => {
    response.sendFile(path.join(__dirname, 'views', '404.html'));
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