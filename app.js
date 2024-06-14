const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true })); // Middleware to parse form data

// MongoDB connection
mongoose.connect('mongodb+srv://mike:12345678$@cluster0.emzh3yv.mongodb.net/alatzhagasha', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('MongoDB connected');
})
.catch(err => {
    console.error('MongoDB connection error:', err);
});

// Route for the home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Route for the create product page
app.get('/creationproduct.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'creationproduct.html'));
});

// all routes for products (CRUD)
const productController = require('./controllers/product');

app.post('/product/create', productController.createProduct);


// Start the server
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
