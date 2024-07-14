const mongoose = require('mongoose');
const Order = require('../models/order');
const Product = require('../models/product');
const Cart = require('../models/cart');
const User = require('../models/user');

// Create order
exports.createOrder = async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).send('Service unavailable. Please try again later.');
    }

    try {
        const cartId = req.body.cartId;
        const cart = await Cart.findById(cartId);
        if (!cart) {
            return res.status(404).send('Cart not found');
        }

        const currentUser = await User.findById(cart.userId);
        if (!currentUser) {
            return res.status(404).send('User not found');
        }

        let message = '';
        let orderOk = true;

        const orderItems = await Promise.all(cart.products.map(async (cartItem) => {
            const product = await Product.findById(cartItem.productId);
            if (!product) {
                throw new Error(`Product with id ${cartItem.productId} not found`);
            }
            if (cartItem.quantity > product.stock) {
                orderOk = false;
                message += `Unfortunately, some of the ${product.name} items have already been ordered by others. 
                You can only order up to ${product.stock} of this item.<br>`;
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
                userId: currentUser._id,
                status: 2,
                total_price: total_price
            });

            await order.save();
        }

        res.status(200).json({ message: message });
    } catch (err) {
        console.error('Error creating order:', err);

        if (err.name === 'ValidationError') {
            return res.status(400).send({ message: 'Validation error', errors: err.errors });
        }

        res.status(500).send('Server error');
    }
};

// Get all orders
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

// Get order by ID
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

// Get orders grouped by date
exports.getOrdersGroupByDate = async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).send('Service unavailable. Please try again later.');
    }

    try {
        const byDateUnit = req.query.dateUnit || 'day';
        let orders;

        switch (byDateUnit) {
            case 'year':
                orders = await Order.aggregate([
                    { $group: { _id: { $year: '$order_date' }, totalIncome: { $sum: '$total_price' } } }
                ]);
                break;
            case 'month':
                orders = await Order.aggregate([
                    { $group: { _id: { $month: '$order_date' }, totalIncome: { $sum: '$total_price' } } }
                ]);
                break;
            case 'yearMonth':
                orders = await Order.aggregate([
                    { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$order_date" } }, totalIncome: { $sum: '$total_price' } } }
                ]);
                break;
            case 'yearWeek':
                if (!req.query.startDate || !req.query.endDate) {
                    return res.status(400).send('Missing start date or end date');
                }

                const startDate = new Date(req.query.startDate);
                const endDate = new Date(req.query.endDate);

                orders = await Order.aggregate([
                    {
                        $match: {
                            order_date: { $gte: startDate, $lte: endDate }
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
                break;
            default:
                orders = await Order.aggregate([
                    { $group: { _id: { $dayOfMonth: '$order_date' }, totalIncome: { $sum: '$total_price' } } }
                ]);
                break;
        }

        res.json(orders);
    } catch (err) {
        console.error('Error getting orders grouped by date:', err);
        res.status(500).send('Server error');
    }
};

// Delete order by ID
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

// Get orders by user ID
exports.getOrdersByUserId = async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).send('Service unavailable. Please try again later.');
    }

    try {
        const userId = req.params.userId;
        const deliveredOrders = await Order.find({ userId: userId }).populate('order_items.productId');
        res.json(deliveredOrders);
    } catch (err) {
        console.error('Error getting orders by user ID:', err);
        res.status(500).send('Server error');
    }
};
