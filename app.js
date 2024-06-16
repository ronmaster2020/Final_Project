const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
app.use('/partials', express.static(__dirname + '/views/partials'));
app.use(express.urlencoded({ extended: true })); // Middleware to parse form data

// MongoDB connection
mongoose.connect('mongodb+srv://mike:12345678$@cluster0.emzh3yv.mongodb.net/test', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('MongoDB connected');
})
.catch(err => {
    console.error('MongoDB connection error:', err);
});

// load the Product model //
const Product = require('./models/product');
const products = [
    {"title": "Ocean Breeze", "price": 35, "gender": 0, "size": 20, "DESC": "Unisex perfume with a fresh ocean scent."},
    {"title": "Mountain Dew", "price": 40, "gender": 1, "size": 25, "DESC": "Male perfume inspired by the mountains."},
    {"title": "Floral Whisper", "price": 45, "gender": 2, "size": 30, "DESC": "Female perfume with a soft floral scent."},
    {"title": "Citrus Spark", "price": 50, "gender": 0, "size": 35, "DESC": "Unisex perfume with a vibrant citrus aroma."},
    {"title": "Woodland", "price": 55, "gender": 1, "size": 40, "DESC": "Male perfume with a deep, woody scent."},
    {"title": "Vanilla Dream", "price": 60, "gender": 2, "size": 45, "DESC": "Female perfume with a sweet vanilla essence."},
    {"title": "Mystic Night", "price": 65, "gender": 0, "size": 50, "DESC": "Unisex perfume for evening wear."},
    {"title": "Arctic Fresh", "price": 70, "gender": 1, "size": 55, "DESC": "Male perfume with a cool, refreshing scent."},
    {"title": "Rose Petals", "price": 75, "gender": 2, "size": 60, "DESC": "Female perfume with a pure rose fragrance."},
    {"title": "Sunset Glow", "price": 80, "gender": 0, "size": 65, "DESC": "Unisex perfume with a warm, inviting aroma."},
    {"title": "Spice Route", "price": 85, "gender": 1, "size": 70, "DESC": "Male perfume with exotic spices."},
    {"title": "Lavender Fields", "price": 90, "gender": 2, "size": 75, "DESC": "Female perfume with a calming lavender scent."},
    {"title": "Tropical Escape", "price": 95, "gender": 0, "size": 80, "DESC": "Unisex summer perfume."},
    {"title": "Urban Edge", "price": 100, "gender": 1, "size": 85, "DESC": "Male perfume with a modern, bold scent."},
    {"title": "Peony Bloom", "price": 105, "gender": 2, "size": 90, "DESC": "Female perfume with a fresh peony fragrance."},
    {"title": "Desert Mirage", "price": 110, "gender": 0, "size": 95, "DESC": "Unisex perfume with a mysterious allure."},
    {"title": "Oceanic", "price": 115, "gender": 1, "size": 100, "DESC": "Male perfume with deep sea notes."},
    {"title": "Gardenia Grace", "price": 120, "gender": 2, "size": 105, "DESC": "Female perfume with a rich gardenia scent."},
    {"title": "Zen Retreat", "price": 125, "gender": 0, "size": 110, "DESC": "Unisex perfume inspired by tranquility."},
    {"title": "Bold Leather", "price": 130, "gender": 1, "size": 115, "DESC": "Male perfume with a strong leather note."},
    {"title": "Jasmine Night", "price": 135, "gender": 2, "size": 120, "DESC": "Female perfume with an intoxicating jasmine scent."},
    {"title": "Crystal Clear", "price": 140, "gender": 0, "size": 125, "DESC": "Unisex perfume with a clear, crisp scent."},
    {"title": "Amber Woods", "price": 145, "gender": 1, "size": 130, "DESC": "Male perfume with warm amber and wood."},
    {"title": "Orchid Oasis", "price": 150, "gender": 2, "size": 135, "DESC": "Female perfume with an exotic orchid scent."},
    {"title": "Silver Mist", "price": 155, "gender": 0, "size": 140, "DESC": "Unisex perfume with a fresh, clean aroma."},
    {"title": "Rustic Pine", "price": 160, "gender": 1, "size": 145, "DESC": "Male perfume with a pine forest scent."},
    {"title": "Cherry Blossom", "price": 165, "gender": 2, "size": 150, "DESC": "Female perfume with a delicate cherry blossom fragrance."},
    {"title": "Midnight Velvet", "price": 170, "gender": 0, "size": 155, "DESC": "Unisex perfume for a sophisticated evening."},
    {"title": "Saffron Zest", "price": 175, "gender": 1, "size": 160, "DESC": "Male perfume with a unique saffron note."},
    {"title": "Magnolia Dew", "price": 180, "gender": 2, "size": 165, "DESC": "Female perfume with a soft magnolia essence."}
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

// Route for the create product page
app.get('/product/new-form', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'productForm.html'));
});

// all routes for products (CRUD)
const productController = require('./controllers/product');

app.post('/product/create', productController.createProduct);

app.get('/product/all', productController.getProducts);

app.get('/products/search', productController.searchProducts);

app.post('/product/update/:id', productController.updateProduct);

app.post('/product/delete/:id', productController.deleteProduct);

app.get('/product/:id', productController.getProductById);

app.use('*', (request, response) => {
    response.sendFile(path.join(__dirname, 'views', '404.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});


app.post('/cart/add', (req, res) => {
    const inputValue = req.body.product_id; // Replace 'inputName' with the title of your input field
    console.log(inputValue); // Print the value to the console  
    res.sendStatus(200);
})