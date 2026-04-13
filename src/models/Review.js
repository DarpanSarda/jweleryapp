import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review_text: {
    type: String,
    trim: true
  },
  user_name: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes
reviewSchema.index({ product_id: 1 });
reviewSchema.index({ rating: 1 });

// Prevent model overwrite error in development
const Review = global.ReviewObject ||
  (global.ReviewObject = mongoose.model('Review', reviewSchema));

export default Review;
