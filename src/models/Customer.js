import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  }
}, {
  timestamps: true
});

// Indexes
// Note: phone index is automatically created due to unique: true
customerSchema.index({ email: 1 });

// Prevent model overwrite error in development
const Customer = global.CustomerObject ||
  (global.CustomerObject = mongoose.model('Customer', customerSchema));

export default Customer;
