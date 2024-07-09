const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define a schema for the items in the order
const orderItemSchema = new Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId, // Assuming you're referencing a Product model
    ref: 'Product',
    required: [true, 'Product ID is required']
  }//,
  // quantity: {
  //   type: Number,
  //   required: [true, 'Quantity is required'],
  //   min: [1, 'Quantity must be at least 1'],
  //   max: [100, 'Quantity must be less than 100']
  // },
  // price: {
  //   type: Number,
  //   required: [true, 'Price is required'],
  //   min: [0.01, 'Price must be at least 0.01'],
  //   max: [1000, 'Price must be less than 1000']
  // },
  // discount: {
  //   type: Number,
  //   required: [true, 'Discount is required'],
  //   // 0% - 100% discount
  //   min: [0, 'Discount must be at least 0'],
  //   max: [100, 'Discount must be less than 100']
  // }
});

const orderSchema = new Schema({
  order_items: {
    type: [{
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product',
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      price: {
        type: Number,
        required: true, 
        min: [0.01, 'Price must be at least 0.01'],
        max: [1000, 'Price must be below 1000']
      }
    }],
    required: [true, 'Order items are required'],
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'UserId is required'],
    ref: 'User',
  },
  status: {
    type: Number,
    enum: [1, 2, 3], // 1: pending, 2: processed, 3: delivered (example statuses)
    default: 1, // default status
  },
  order_date: {
    type: Date,
    default: Date.now,
  }
});



// function calculateTotal(orderItems) {
//   return orderItems.reduce((acc, item) => {
//     const itemTotal = item.price * item.quantity; // * (1 - item.discount / 100)
//     return acc + itemTotal;
//   }, 0);
// }

// orderSchema.pre('save', function(next) {
//   // Calculate the total using the calculateTotal function
//   this.total = calculateTotal(this.order_items);
//   next();
// });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;