import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  product_name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    lowercase: true,
    default: function() {
      // Generate slug from product_name if not provided
      return this.product_name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || '';
    }
  },
  short_description: {
    type: String,
    default: ''
  },
  long_description: {
    type: String,
    default: ''
  },
  original_price: {
    type: Number,
    min: 0
  },
  discounted_price: {
    type: Number,
    required: true,
    min: 0
  },
  discount_percentage: {
    type: Number,
    min: 0,
    max: 100
  },
  images: [{
    type: String
  }],
  stock: {
    type: Number,
    default: 1,
    min: 0
  },
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  is_sold: {
    type: Boolean,
    default: false
  },
  is_featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for faster queries
productSchema.index({ category_id: 1 });
productSchema.index({ is_sold: 1 });
productSchema.index({ is_featured: 1 });
productSchema.index({ product_name: 'text', short_description: 'text', long_description: 'text' });

// Prevent model overwrite error in development
const Product = global.ProductObject ||
  (global.ProductObject = mongoose.model('Product', productSchema));

export default Product;
