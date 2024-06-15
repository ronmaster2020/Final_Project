const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true })); // Middleware to parse form data

// MongoDB connection
mongoose.connect('mongodb+srv://mike:12345678$@cluster0.emzh3yv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
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
app.get('/product/new-form', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'productForm.html'));
});

// all routes for products (CRUD)
const productController = require('./controllers/product');

app.post('/product/create', productController.createProduct);

app.get('/product/all', productController.getProducts);

app.get('/product/:id', productController.getProductById);

app.post('/product/update/:id', productController.updateProduct);

app.post('/product/delete/:id', productController.deleteProduct);

app.use('*', (request, response) => {
    response.sendFile(path.join(__dirname, 'views', '404.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});


app.post('/cart/add', (req, res) => {
    const inputValue = req.body.product_id; // Replace 'inputName' with the name of your input field
    console.log(inputValue); // Print the value to the console  
    res.sendStatus(200);
})