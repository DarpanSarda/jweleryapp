import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  // Session identifier (could be user_id or session_id for guest users)
  session_id: {
    type: String,
    required: true
  },
  // Array of products with their details
  items: [{
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    product_name: String,
    product_image: String,
    price: Number,
    quantity: {
      type: Number,
      default: 1,
      min: 1
    },
    subtotal: Number
  }],
  // Cart totals
  subtotal: {
    type: Number,
    default: 0
  },
  shipping_charge: {
    type: Number,
    default: 0
  },
  grand_total: {
    type: Number,
    default: 0
  },
  // Metadata
  last_updated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
cartSchema.index({ session_id: 1 });
cartSchema.index({ createdAt: 1 });

// Method to calculate totals
cartSchema.methods.calculateTotals = function(shippingCharge = 0) {
  this.subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  this.shipping_charge = shippingCharge;
  this.grand_total = this.subtotal + this.shipping_charge;
  this.last_updated = new Date();
  return this.save();
};

// Prevent model overwrite error in development
const Cart = global.CartObject ||
  (global.CartObject = mongoose.model('Cart', cartSchema));

export default Cart;
