const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderItemSchema = new Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0.01, 'Price must be at least 0.01'],
    max: [1000, 'Price must be below 1000']
  }
});

const orderSchema = new Schema({
  order_items: {
    type: [orderItemSchema],
    required: [true, 'Order items are required']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'UserId is required'],
    ref: 'User'
  },
  status: {
    type: Number,
    enum: [1, 2, 3], // 1: pending, 2: processed, 3: delivered (example statuses)
    default: 1 // default status
  },
  order_date: {
    type: Date,
    default: Date.now
  },
  total_price: {
    type: Number,
    required: true
  }
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
