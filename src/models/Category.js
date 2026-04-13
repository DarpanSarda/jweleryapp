import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    default: function() {
      // Generate slug from name if not provided
      return this.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || '';
    }
  },
  description: {
    type: String,
    default: ''
  },
  emoji: {
    type: String,
    default: ''
  },
  display_order: {
    type: Number,
    default: 0
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Prevent model overwrite error in development
const Category = global.CategoryObject ||
  (global.CategoryObject = mongoose.model('Category', categorySchema));

export default Category;
