const mongoose = require('mongoose');
const Order = require('../models/order');
const Product = require('../models/product');
const globalState = require('../globalState'); // Import global state
const Cart = require('../models/cart');
const User = require('../models/user');

exports.createOrder = async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).send('Service unavailable. Please try again later.');
    }

    try {
        //Find the right cart to get the products from 
        const cartId = globalState.cartId;
        const cart = await Cart.findById(cartId);

        // Push the new order id to user's array 
        const currentUser = await User.findOne({ cartId: cartId });
        if (!currentUser) {
            return res.status(404).send('User not found');
        }

        let message = '';
        let orderOk = true;

        // Fetch product details for each product in the cart
        const orderItems = await Promise.all(cart.products.map(async (cartItem) => {
            const product = await Product.findById(cartItem.productId);
            if (!product) {
                throw new Error(`Product with id ${cartItem.productId} not found`);
            }
            if(cartItem.quantity > product.stock) {
                orderOk = false;
                message += `Unfortunately, some of the ${product.name} items have already been ordered by others. 
                You can only order up to ${product.stock} of this item.`;
                message += '<br>';
            }

            return {
                productId: product._id,
                quantity: cartItem.quantity,
                price: product.price // Assuming product has a price field
            };
        }));

        let total_price = orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);

        // Save the order
        if (!orderOk) {
            return res.status(400).send(message);
        }
        const order = new Order({
            order_items: orderItems,
            userId: currentUser._id,
            status: 2,
            total_price: total_price
        });

        console.log(order);

        await order.save();

        res.status(200).json({ message: 'Order created successfully', order });
    } catch (err) {
        console.error('Error creating order:', err);

        // Handle validation errors
        if (err.name === 'ValidationError') {
            return res.status(400).send({ message: 'Validation error', errors: err.errors });
        }

        // For other types of errors, send a generic server error response
        res.status(500).send('Server error');
    }
};

exports.getOrders = async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).send('Service unavailable. Please try again later.');
    }

    try {
        const orders = await Order.find();
        res.json(orders);
    } catch (err) {
        console.error('Error getting orders:', err);
        res.status(500).send('Server error');
    }
};

exports.getOrderById = async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).send('Service unavailable. Please try again later.');
    }

    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).send('Order not found');
        }
        res.json(order);
    } catch (err) {
        console.error('Error getting order by ID:', err);
        res.status(500).send('Server error');
    }
};

exports.getOrdersGroupByDate = async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).send('Service unavailable. Please try again later.');
    }
    let orders;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    try {
        const byDateUnit = req.query.dateUnit || 'day';
        if (!['month', 'year', 'yearMonth', 'yearWeek', 'yearMonthDay'].includes(byDateUnit)) {
            console.error('Invalid date unit:', byDateUnit);
            return res.status(400).send('Invalid date unit');
        }
        if (byDateUnit === 'year') {
            orders = await Order.aggregate([
                {
                    $group: {
                        _id: { $year: '$order_date' },
                        totalIncome: { $sum: '$total_price' }
                    }
                }
            ]);
        }
        else if (byDateUnit === 'month') {
            orders = await Order.aggregate([
                {
                    $group: {
                        _id: { $month: '$order_date' },
                        totalIncome: { $sum: '$total_price' }
                    }
                }
            ]);
        }
        else if (byDateUnit === 'yearMonth') {
            orders = await Order.aggregate([
                {
                    $group: {
                        _id: { 
                            year: { $year: "$order_date" },
                            month: { $month: "$order_date" }
                        },
                        totalIncome: { $sum: '$total_price' }
                    }
                }
            ]);
        }
        else if (byDateUnit === 'yearWeek') {
            if (!startDate || !endDate) {
                return res.status(400).send('Missing start date or end date');
            }

            orders = await Order.aggregate([
                {
                    $match: {
                        order_date: {
                            $gte: new Date(startDate),
                            $lte: new Date(endDate)
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: "$order_date" },
                            week: { $week: "$order_date" }
                        },
                        totalIncome: { $sum: '$total_price' }
                    }
                }
            ]);
        }
        else if (byDateUnit === 'yearMonthDay') {
            if (!startDate || !endDate) {
                return res.status(400).send('Missing start date or end date');
            }

            orders = await Order.aggregate([
                {
                    $match: {
                        order_date: {
                            $gte: new Date(startDate),
                            $lte: new Date(endDate)
                        }
                    }
                },
                {
                    $group: {
                        _id: { 
                            year: { $year: "$order_date" },
                            month: { $month: "$order_date" },
                            day: { $dayOfMonth: "$order_date" }
                        },
                        totalIncome: { $sum: '$total_price' }
                    }
                }
            ]);
        }
        res.json(orders);
    } catch (err) {
        console.error('Error getting orders grouped by date:', err);
        res.status(500).send('Server error');
    }
};

exports.deleteOrder = async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).send('Service unavailable. Please try again later.');
    }

    try {
        const orderId = req.params.id;
        
        const deletedOrder = await Order.findByIdAndDelete(orderId);
        if (!deletedOrder) {
            return res.status(404).send('Order not found');
        }

        res.json({ message: 'Order deleted successfully', deletedOrder });
    } catch (err) {
        console.error('Error deleting order by ID:', err);
        res.status(500).send('Server error');
    }
};

exports.getOrdersByUserId = async (req, res) => { // !!!!! specificly to populate fields !!!!!!
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).send('Service unavailable. Please try again later.');
    }

    try {
        const userId = req.params.userId;
        const deliveredOrders = await Order.find({ userId: userId}).populate('order_items.productId');
        res.json(deliveredOrders);
    } catch (err) {
        console.error('Error getting orders by user ID:', err);
        res.status(500).send('Server error');
    }
};
