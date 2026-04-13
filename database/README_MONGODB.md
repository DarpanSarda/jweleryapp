# MongoDB Database Setup for vezura E-commerce

This directory contains MongoDB models and configuration for the vezura jewelry e-commerce application.

## Prerequisites

1. **MongoDB Installation**
   - Install MongoDB locally: https://www.mongodb.com/try/download/community
   - Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

2. **Node.js Dependencies**
   ```bash
   npm install mongoose
   ```

## Environment Variables

Create a `.env.local` file in your project root:

```env
# MongoDB Connection String
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/vezura_db

# OR MongoDB Atlas (Cloud)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vezura_db?retryWrites=true&w=majority
```

## Database Models

### 1. **Category** (`database/models/Category.js`)
```javascript
{
  category_name: String,    // "Earrings", "Rings", etc.
  slug: String,             // "earrings", "rings"
  description: String,
  emoji: String,            // "💎", "💍"
  display_order: Number,
  is_active: Boolean
}
```

### 2. **Product** (`database/models/Product.js`)
```javascript
{
  product_name: String,
  slug: String,
  short_description: String,
  description: String,
  original_price: Number,
  discounted_price: Number,
  discount_percentage: Number,
  main_image: String,
  other_images: [String],   // Array of image URLs
  stock_quantity: Number,
  category_id: ObjectId,    // Reference to Category
  is_sold: Boolean,
  is_featured: Boolean
}
```

### 3. **Customer** (`database/models/Customer.js`)
```javascript
{
  name: String,
  phone: String,            // Unique
  email: String
}
```

### 4. **Order** (`database/models/Order.js`)
```javascript
{
  customer_id: ObjectId,    // Reference to Customer
  order_number: String,     // Unique (e.g., "ORD-001")
  items: [{                 // Embedded order items
    product_id: ObjectId,
    product_name: String,
    product_image: String,
    quantity: Number,
    price: Number,
    subtotal: Number
  }],
  subtotal: Number,
  discount: Number,
  shipping_charge: Number,
  grand_total: Number,
  payment_method: String,   // "COD", "Prepaid", "UPI"
  order_status: String,     // "pending", "confirmed", "shipped", "delivered", "cancelled"
  user_name: String,
  user_email: String,
  user_number: String,
  user_address: String,
  user_city: String,
  user_state: String,
  user_pincode: String,
  customer_notes: String,
  admin_notes: String
}
```

### 5. **Review** (`database/models/Review.js`)
```javascript
{
  product_id: ObjectId,     // Reference to Product
  rating: Number,           // 1-5
  review_text: String,
  user_name: String,
  is_approved: Boolean      // For moderation
}
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install mongoose
```

### 2. Configure Environment
```bash
# Create .env.local file
echo "MONGODB_URI=mongodb://localhost:27017/vezura_db" > .env.local
```

### 3. Seed Database (Optional)
```bash
node database/seeds/seedData.js
```

This will populate your database with:
- 5 categories (Earrings, Rings, Necklace, Bracelet, Hamper)
- 5 sample products

## Usage in Next.js

### Database Connection (`lib/db.js`)
```javascript
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI in .env.local');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => {
      return mongoose;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;
```

### Example API Route (`app/api/products/route.js`)
```javascript
import connectDB from '@/lib/db';
import { Product } from '@/database/models';

export async function GET(request) {
  try {
    await connectDB();

    const products = await Product.find({ is_sold: false })
      .populate('category_id')
      .sort({ createdAt: -1 });

    return Response.json(products);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
```

### Example: Creating an Order (`app/api/orders/route.js`)
```javascript
import connectDB from '@/lib/db';
import { Order, Customer } from '@/database/models';

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    // Generate order number
    const orderCount = await Order.countDocuments();
    const orderNumber = `ORD-${String(orderCount + 1).padStart(4, '0')}`;

    // Create or find customer
    let customer;
    if (body.user_email) {
      customer = await Customer.findOneAndUpdate(
        { phone: body.user_number },
        {
          name: body.user_name,
          phone: body.user_number,
          email: body.user_email
        },
        { upsert: true, new: true }
      );
    }

    // Calculate subtotals for each item
    const items = body.items.map(item => ({
      ...item,
      subtotal: item.price * item.quantity
    }));

    // Create order
    const order = await Order.create({
      customer_id: customer?._id,
      order_number: orderNumber,
      items,
      subtotal: body.subtotal,
      discount: body.discount || 0,
      shipping_charge: body.shipping_charge || 0,
      grand_total: body.grand_total,
      payment_method: body.payment_method || 'COD',
      user_name: body.user_name,
      user_email: body.user_email,
      user_number: body.user_number,
      user_address: body.user_address,
      user_city: body.user_city,
      user_state: body.user_state,
      user_pincode: body.user_pincode,
      customer_notes: body.customer_notes
    });

    return Response.json(order, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
```

## MongoDB vs SQL Differences

### Advantages of MongoDB:
1. **Flexible Schema** - Easy to add new fields without migrations
2. **Embedded Documents** - Order items stored directly in order (no separate table needed)
3. **JSON Native** - Perfect for JavaScript/Node.js applications
4. **Scalability** - Easy to scale horizontally

### Key Differences from SQL:
- No `JOIN` needed (use `.populate()` instead)
- Embedded arrays (order items inside order)
- `_id` instead of `id`
- Automatic timestamps with `timestamps: true`
- No foreign key constraints (application-level validation)

## MongoDB Compass (GUI Tool)

Download MongoDB Compass to visualize your data:
https://www.mongodb.com/try/download/compass

## Troubleshooting

### Connection Issues
```bash
# Check if MongoDB is running (local)
# Windows
net start MongoDB

# Mac/Linux
sudo systemctl start mongod
```

### Reset Database
```javascript
// Run this in a Node script
await mongoose.connect('mongodb://localhost:27017/vezura_db');
await mongoose.connection.db.dropDatabase();
console.log('Database dropped');
```

## Next Steps

1. Set up MongoDB (local or Atlas)
2. Install mongoose dependency
3. Configure environment variables
4. Run seed data script
5. Create API routes using the models
6. Integrate with frontend components

---

For issues or questions, contact the development team.
