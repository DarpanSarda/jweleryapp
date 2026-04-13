import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  product_name: {
    type: String,
    required: true
  },
  product_image: {
    type: String
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  }
});

const orderSchema = new mongoose.Schema({
  cart_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cart'
  },
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  order_number: {
    type: String,
    required: true,
    unique: true
  },
  items: [orderItemSchema], // Embedded array of order items
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  shipping_charge: {
    type: Number,
    default: 0,
    min: 0
  },
  grand_total: {
    type: Number,
    required: true,
    min: 0
  },
  payment_method: {
    type: String,
    enum: ['COD', 'Prepaid', 'UPI'],
    default: 'COD'
  },
  order_status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  // Customer details (stored for order history)
  user_name: {
    type: String,
    required: true
  },
  user_email: {
    type: String
  },
  user_number: {
    type: String,
    required: true
  },
  user_address: {
    type: String,
    required: true
  },
  user_city: {
    type: String,
    required: true
  },
  user_state: {
    type: String
  },
  user_pincode: {
    type: String,
    required: true
  },
  // Additional information
  customer_notes: {
    type: String
  },
  admin_notes: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes
orderSchema.index({ customer_id: 1 });
// Note: order_number index is automatically created due to unique: true
orderSchema.index({ order_status: 1 });
orderSchema.index({ createdAt: -1 });

// Method to calculate grand total
orderSchema.methods.calculateTotals = function() {
  this.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);
  this.grand_total = this.subtotal + this.shipping_charge - this.discount;
  return this.grand_total;
};

// Prevent model overwrite error in development
const Order = global.OrderObject ||
  (global.OrderObject = mongoose.model('Order', orderSchema));

export default Order;
