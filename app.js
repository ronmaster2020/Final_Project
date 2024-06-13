const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Product = require('./models/product'); // Assuming 'product.js' is inside the 'models' directory
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

// POST route to handle form submission
app.post('/create-product', async (req, res) => {
    try {
        // Extract data from the request body
        const { title, price, gender } = req.body;

        // Create a new Product document
        const newProduct = new Product({
            title,
            price,
            gender
        });

        // Save the product to MongoDB
        await newProduct.save();

        // Redirect or respond with a success message
        res.status(201).send('Product created successfully!');
    } catch (err) {
        console.error('Error creating product:', err);
        res.status(500).send('Server error');
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
