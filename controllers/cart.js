const mongoose = require('mongoose');
const Cart = require('../models/cart');
const globalState = require('../globalState'); // Import global state

// !!!!!!!!!!! sprint 2 - because we need users !!!!!
// this one is just an intuition

exports.createCart = async(req, res) => {
    // Check if the database is connected
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).send('Service unavailable. Please try again later.');
    }

    try {
        const newCart = new Cart();

        //const newProduct1 = {
            //productId: '66754afa008577e463e3062b',
            //quantity: 3 // Adjust quantity as needed
        //};
        //const newProduct2 = {
            //productId: '667567b72642681c6b5397ac',
            //quantity: 2 // Adjust quantity as needed
        //};
          
        //newCart.products.push(newProduct1);
        //newCart.products.push(newProduct2);
          
        newCart.save()
            .then(() => {
              console.log('Products added to cart successfully!');
        })
          
        res.status(201).send('Cart created successfully!');
    } catch (err) {
        console.error('Error creating cart:', err);
        res.status(500).send('Server error');
    }
};

exports.AddToCart = async(req, res) => {
    // Check if the database is connected
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).send('Service unavailable. Please try again later.');
    }

    try {
        // !!!!!!!!!!! sprint 2 - because we need users first !!!!!
        // at sprint 2 we need to get the user id from the session and not from the request body
        const cart = await Cart.findOne(req.body.id);
        const existingProductIndex = cart.products.findIndex(p => p.productId.toString() === req.params.productId);
        if (existingProductIndex >= 0) {
            cart.products[existingProductIndex].quantity += 1; // Increment quantity if product exists
        } else {
            cart.products.push({ productId: req.params.productId, quantity: 1 }); // Add new product with quantity 1
        }
        await cart.save();
        res.status(201).send('Product added to cart successfully!');
    } catch (err) {
        console.error('Error adding product to cart:', err);
        res.status(500).send('Server error');
    }
}

exports.getAllCarts = async(req, res) => {
    // Check if the database is connected
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).send('Service unavailable. Please try again later.');
    }

    try {
        const carts = await Cart.find();
        res.json(carts);
        //console.log(carts);
        //return carts;
    } catch (err) {
        console.error('Error getting carts:', err);
        res.status(500).send('Server error');
    }
};


exports.deleteCart = async (req, res) => {
    //check if the database is connected
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).send('Service unavailable. Please try again later.');
    }

    try {
        //find cart id from req body
        const cartId = req.body.cartId;
        const cart = await Cart.findByIdAndDelete(cartId);

        //check if the cart is found
        if (!cart) {
            return res.status(404).send('Cart not found');
        }

        res.status(200).send('Cart deleted successfully!');
    } catch (err) {
        console.error('Error deleting cart:', err);
        res.status(500).send('Server error');
    }
};

  

exports.deleteProductFromCart = async (req, res) => {
    // Check if the database is connected
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).send('Service unavailable. Please try again later.');
    }

    try {
        const cartId = req.body.cartId;
        const productId = req.body.productId;

        // Check if cartId and productId are provided
        if (!cartId || !productId) {
            return res.status(400).send('Missing cartId or productId');
        }

        // Use $pull operator to remove product from cart.products
        const cart = await Cart.findOneAndUpdate(
            { _id: cartId },
            { $pull: { products: { productId } } },
            { new: true } // To return the updated cart
        );

        // Check if cart is found and product exists
        if (!cart) {
            return res.status(404).send('Cart or product not found');
        }

        res.status(200).send('Product deleted from cart successfully!');
    } catch (err) {
        console.error('Error deleting product from cart:', err);
        res.status(500).send('Server error');
    }
};
  
  


exports.deleteAllProductsFromCart = async (req, res) => {
    
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).send('Service unavailable. Please try again later.');
    }

    try {
        const cartId = req.body.cartId;

        
        if (!cartId) {
            return res.status(400).send('Missing cartId');
        }

        //Use $set operator to empty the products array (cool af)
        const cart = await Cart.findOneAndUpdate(
            { _id: cartId },
            { $set: { products: [] } },
            { new: true } // To return the updated cart
        );

        //Check if cart is found
        if (!cart) {
            return res.status(404).send('Cart not found');
        }

        res.status(200).send('All products deleted from cart successfully!');
    } catch (err) {
        console.error('Error deleting all products from cart:', err);
        res.status(500).send('Server error');
    }
};

// !!!!!!!!!!! sprint 2 - because we need users first !!!!!


exports.getCartById = async (req, res) => {
    try {
        const cartId = globalState.cartId;

        if (!cartId) {
            return res.status(404).send('Cart not found');
        }

        const cart = await Cart.findById(cartId);

        if (!cart) {
            return res.status(404).send('Cart not found');
        }

        res.status(200).json(cart);
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).send('Server error');
    }
};
