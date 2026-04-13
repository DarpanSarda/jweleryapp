import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Customer from "@/models/Customer";
import Product from "@/models/Product";
import Cart from "@/models/Cart";
import { NextResponse } from "next/server";

// GET all orders (with optional filters)
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get('phone');
    const orderNumber = searchParams.get('order_number');

    let query = {};

    if (phoneNumber) {
      query.user_number = phoneNumber;
    }

    if (orderNumber) {
      query.order_number = orderNumber;
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST create a new order
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    // Validate cart_id
    if (!body.cart_id) {
      return NextResponse.json(
        { error: 'Cart ID is required' },
        { status: 400 }
      );
    }

    // Fetch cart with items
    const cart = await Cart.findById(body.cart_id).populate('items.product_id');
    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { error: 'Cart not found or is empty' },
        { status: 404 }
      );
    }

    // Validate required customer fields
    if (!body.customer_name || !body.customer_mobile || !body.customer_address ||
        !body.customer_city || !body.customer_pincode) {
      return NextResponse.json(
        { error: 'Missing required customer information' },
        { status: 400 }
      );
    }

    // Validate stock for all items
    const stockValidationErrors = [];
    for (const item of cart.items) {
      const product = await Product.findById(item.product_id._id);
      if (!product) {
        stockValidationErrors.push(`${item.product_name} is no longer available`);
        continue;
      }
      if (product.stock < item.quantity) {
        stockValidationErrors.push(`Only ${product.stock} ${item.product_name} available (requested: ${item.quantity})`);
      }
    }

    if (stockValidationErrors.length > 0) {
      return NextResponse.json(
        {
          error: 'Stock validation failed',
          details: stockValidationErrors
        },
        { status: 400 }
      );
    }

    // Find or create customer
    let customer = null;
    customer = await Customer.findOneAndUpdate(
      { phone: body.customer_mobile },
      {
        name: body.customer_name,
        phone: body.customer_mobile,
        email: body.customer_email || ''
      },
      { upsert: true, new: true }
    );

    // Generate order number
    const orderCount = await Order.countDocuments();
    const orderNumber = `ORD-${String(orderCount + 1).padStart(4, '0')}`;

    // Prepare order items from cart
    const orderItems = cart.items.map(item => ({
      product_id: item.product_id._id,
      product_name: item.product_name,
      product_image: item.product_image,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.subtotal
    }));

    // Create order
    const order = await Order.create({
      cart_id: cart._id,
      customer_id: customer?._id,
      order_number: orderNumber,
      items: orderItems,
      subtotal: cart.subtotal,
      shipping_charge: cart.shipping_charge,
      discount: 0,
      grand_total: cart.grand_total,
      payment_method: 'COD',
      order_status: 'pending',
      user_name: body.customer_name,
      user_email: body.customer_email,
      user_number: body.customer_mobile,
      user_address: body.customer_address,
      user_city: body.customer_city,
      user_state: body.customer_state || '',
      user_pincode: body.customer_pincode,
      customer_notes: body.customer_notes
    });

    // Update product stock
    await Promise.all(
      cart.items.map(async (item) => {
        await Product.findByIdAndUpdate(
          item.product_id._id,
          { $inc: { stock: -item.quantity } }
        );
      })
    );

    // Clear the cart after order
    cart.items = [];
    cart.subtotal = 0;
    cart.shipping_charge = 0;
    cart.grand_total = 0;
    await cart.save();

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
