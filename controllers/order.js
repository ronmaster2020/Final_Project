const mongoose = require('mongoose');
const Order = require('../models/order');
const Product = require('../models/product');
const Cart = require('../models/cart');
const User = require('../models/user');

// Middleware to check DB connection
const checkDBConnection = (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).send('Service unavailable. Please try again later.');
    }
    next();
};

// Create order
exports.createOrder = [checkDBConnection, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const user = await User.findById(userId).session(session);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const cart = await Cart.findById(user.cartId).session(session);
        if (!cart) {
            return res.status(404).send('Cart not found');
        }

        let message = '';
        let orderOk = true;

        const orderItems = await Promise.all(cart.products.map(async (cartItem) => {
            const product = await Product.findById(cartItem.productId).session(session);
            if (!product) {
                throw new Error(`Product with id ${cartItem.productId} not found`);
            }
            if (cartItem.quantity > product.stock && product.stock > 0) {
                orderOk = false;
                message += `Unfortunately, some of the ${product.name} items have already been ordered by others. 
                You can only order up to ${product.stock} of this item.<br>`;
            } else if (product.stock === 0) {
                orderOk = false;
                message += `Unfortunately, the ${product.name} is out of stock.<br>`;
            } else {
                product.stock -= cartItem.quantity;
                await product.save({ session });
            }
            return {
                productId: product._id,
                quantity: cartItem.quantity,
                price: product.price
            };
        }));

        let total_price = orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);

        if (orderOk) {
            const order = new Order({
                order_items: orderItems,
                userId: user._id,
                status: 2,
                total_price: total_price
            });

            await order.save({ session });
        }

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ message: message });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();

        console.error('Error creating order:', err);

        if (err.name === 'ValidationError') {
            return res.status(400).send({ message: 'Validation error', errors: err.errors });
        }

        res.status(500).send('Server error');
    }
}];

// Get all orders
exports.getOrders = [checkDBConnection, async (req, res) => {
    try {
        const orders = await Order.find();
        res.json(orders);
    } catch (err) {
        console.error('Error getting orders:', err);
        res.status(500).send('Server error');
    }
}];

// Get order by ID
exports.getOrderById = [checkDBConnection, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        console.log(user);
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const order = await Order.findById(req.params.id);
        console.log(order);
        if (!order) {
            return res.status(404).send('Order not found');
        }
        if (user._id.toString() !== order.userId.toString() && user.access !== 'staff' && user.access !== 'admin') {
            return res.status(403).send('Access denied');
        } else {
            return res.json(order);
        }
    } catch (err) {
        console.error('Error getting order by ID:', err);
        res.status(500).send('Server error');
    }
}];

exports.getOrdersGroupByDate = [checkDBConnection, async (req, res) => {
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
    }];

// Delete order by ID
exports.deleteOrder = [checkDBConnection, async (req, res) => {
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
}];

// Get orders by user ID
exports.getOrdersByUserId = [checkDBConnection, async (req, res) => {
    try {
        const userId = req.session.userId;
        const deliveredOrders = await Order.find({ userId: userId }).populate('order_items.productId');
        res.json(deliveredOrders);
    } catch (err) {
        console.error('Error getting orders by user ID:', err);
        res.status(500).send('Server error');
    }
}];