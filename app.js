const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const multer  = require('multer')
const upload = multer()
const app = express();
const PORT = process.env.PORT || 8080;
app.use(express.json());
// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
app.use('/partials', express.static(__dirname + '/views/partials'));
app.use(express.urlencoded({ extended: true })); // Middleware to parse form data

// MongoDB connection
mongoose.connect('mongodb+srv://mike:cIBBf4X6JasSW8oK@cluster0.emzh3yv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
 , {
    
    
})
.then(() => {
    console.log('MongoDB connected');
})
.catch(err => {
    console.error('MongoDB connection error:', err);
});

// Configure storage options
const product_file_storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, 'file_uploads', 'products_files'));
    },
    filename: function(req, file, cb) {
        cb(null, `${file.originalname}.${Date.now()}`); // Set the file name
    }
});

const product_file_upload = multer({ storage: product_file_storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10 MB file size limit

// load the Product model //
const Product = require('./models/product');
const products = [
    {"name": "Ocean Breeze", "price": 35, "gender": 3, "size": 20, "DESC": "Unisex perfume with a fresh ocean scent.", "stock": 500},
    {"name": "Mountain Dew", "price": 40, "gender": 1, "size": 25, "DESC": "Male perfume inspired by the mountains.", "stock": 750},
    {"name": "Floral Whisper", "price": 45, "gender": 2, "size": 30, "DESC": "Female perfume with a soft floral scent.", "stock": 250},
    {"name": "Citrus Spark", "price": 50, "gender": 3, "size": 35, "DESC": "Unisex perfume with a vibrant citrus aroma.", "stock": 1000},
    {"name": "Woodland", "price": 55, "gender": 1, "size": 40, "DESC": "Male perfume with a deep, woody scent.", "stock": 800},
    {"name": "Vanilla Dream", "price": 60, "gender": 2, "size": 45, "DESC": "Female perfume with a sweet vanilla essence.", "stock": 600},
    {"name": "Mystic Night", "price": 65, "gender": 3, "size": 50, "DESC": "Unisex perfume for evening wear.", "stock": 400},
    {"name": "Arctic Fresh", "price": 70, "gender": 1, "size": 55, "DESC": "Male perfume with a cool, refreshing scent.", "stock": 900},
    {"name": "Rose Petals", "price": 75, "gender": 2, "size": 60, "DESC": "Female perfume with a pure rose fragrance.", "stock": 300},
    {"name": "Sunset Glow", "price": 80, "gender": 3, "size": 65, "DESC": "Unisex perfume with a warm, inviting aroma.", "stock": 700},
    {"name": "Spice Route", "price": 85, "gender": 1, "size": 70, "DESC": "Male perfume with exotic spices.", "stock": 100},
    {"name": "Lavender Fields", "price": 90, "gender": 2, "size": 75, "DESC": "Female perfume with a calming lavender scent.", "stock": 950},
    {"name": "Tropical Escape", "price": 95, "gender": 3, "size": 80, "DESC": "Unisex summer perfume.", "stock": 550},
    {"name": "Urban Edge", "price": 100, "gender": 1, "size": 85, "DESC": "Male perfume with a modern, bold scent.", "stock": 350},
    {"name": "Peony Bloom", "price": 105, "gender": 2, "size": 90, "DESC": "Female perfume with a fresh peony fragrance.", "stock": 150},
    {"name": "Desert Mirage", "price": 110, "gender": 3, "size": 95, "DESC": "Unisex perfume with a mysterious allure.", "stock": 450},
    {"name": "Oceanic", "price": 115, "gender": 1, "size": 100, "DESC": "Male perfume with deep sea notes.", "stock": 850},
    {"name": "Gardenia Grace", "price": 120, "gender": 2, "size": 105, "DESC": "Female perfume with a rich gardenia scent.", "stock": 650},
    {"name": "Zen Retreat", "price": 125, "gender": 3, "size": 110, "DESC": "Unisex perfume inspired by tranquility.", "stock": 950},
    {"name": "Bold Leather", "price": 130, "gender": 1, "size": 115, "DESC": "Male perfume with a strong leather note.", "stock": 250},
    {"name": "Jasmine Night", "price": 135, "gender": 2, "size": 120, "DESC": "Female perfume with an intoxicating jasmine scent.", "stock": 750},
    {"name": "Crystal Clear", "price": 140, "gender": 3, "size": 125, "DESC": "Unisex perfume with a clear, crisp scent.", "stock": 550},
    {"name": "Amber Woods", "price": 145, "gender": 1, "size": 130, "DESC": "Male perfume with warm amber and wood.", "stock": 850},
    {"name": "Orchid Oasis", "price": 150, "gender": 2, "size": 135, "DESC": "Female perfume with an exotic orchid scent.", "stock": 650},
    {"name": "Silver Mist", "price": 155, "gender": 3, "size": 140, "DESC": "Unisex perfume with a fresh, clean aroma.", "stock": 450},
    {"name": "Rustic Pine", "price": 160, "gender": 1, "size": 145, "DESC": "Male perfume with a pine forest scent.", "stock": 750},
    {"name": "Cherry Blossom", "price": 165, "gender": 2, "size": 150, "DESC": "Female perfume with a delicate cherry blossom fragrance.", "stock": 550},
    {"name": "Midnight Velvet", "price": 170, "gender": 3, "size": 155, "DESC": "Unisex perfume for a sophisticated evening.", "stock": 350},
    {"name": "Saffron Zest", "price": 175, "gender": 1, "size": 160, "DESC": "Male perfume with a unique saffron note.", "stock": 950},
    {"name": "Magnolia Dew", "price": 180, "gender": 2, "size": 165, "DESC": "Female perfume with a soft magnolia essence.", "stock": 650}
];
  
  async function initializeData() {
    try {
      await Product.deleteMany({}); // Deletes all existing products
      await Product.insertMany(products); // Inserts new product data
      console.log('Product data initialized.');
    } catch (error) {
      console.error('Error initializing product data:', error);
    }
  }
  
  initializeData();
// complete load product model //

// Route for the sending pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/products', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'products.html'));
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

app.get('/admin/customers'/*, validateAdmin()*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin_customers.html'));
});

app.get('/admin/settings'/*, validateAdmin()*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin_settings.html'));
});

app.get('/orderhistory', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'orderHistory.html'));
});

// Route for the create product page
app.get('/product/new-form', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'productForm.html'));
});

app.get('/viewCart', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'cart.html'));
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

// all routes for products (CRUD)

const productController = require('./controllers/product');

app.post('/product/create', product_file_upload.array('productImage', 10), productController.createProduct);

app.get('/product/all', productController.getProducts);

app.get('/products/search', productController.searchProducts);

app.post('/product/update/:id', productController.updateProduct);

app.post('/product/delete/:id', productController.deleteProduct);

app.get('/product/:id', productController.getProductById);

// all routes for orders (CRUD)
const orderController = require('./controllers/order');

app.post('/order/create', orderController.createOrder);

app.get('/order/all', orderController.getOrders);

app.get('/order/:id', orderController.getOrderById);

// all routes for cart (CRUD)
const cartController = require('./controllers/cart');

app.post('/cart/create', cartController.createCart);

app.post('/cart/add/:productId', cartController.AddToCart);

app.get('/cart/all', cartController.getAllCarts);

app.post('/cart/delete', cartController.deleteCart);


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

//app.get('/getFirstName/:id', SettingsController.getFirstName);

//app.get('/getLastName/:id', SettingsController.getLastName);

//app.get('/getBio/:id', SettingsController.getBio);

//app.get('/getAddress/:id', SettingsController.getAddress);

//app.get('/getPhoneNumber/:id', SettingsController.getPhoneNumber);

//app.get('/getEmail/:id', SettingsController.getEmail);

//app.get('/getPassword/:id', SettingsController.getPassword);

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