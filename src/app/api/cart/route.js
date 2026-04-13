import connectDB from "@/lib/db";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

// Helper function to get or create session ID
function getSessionId(request) {
  const { searchParams } = new URL(request.url);
  let sessionId = searchParams.get('session_id');

  if (!sessionId) {
    // Generate a simple session ID if not provided
    sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  return sessionId;
}

// GET cart by session_id
export async function GET(request) {
  try {
    await connectDB();

    const sessionId = getSessionId(request);

    let cart = await Cart.findOne({ session_id: sessionId }).populate('items.product_id').lean();

    // If no cart exists, return empty cart
    if (!cart) {
      return NextResponse.json({
        session_id: sessionId,
        items: [],
        subtotal: 0,
        shipping_charge: 0,
        grand_total: 0
      });
    }

    return NextResponse.json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

// POST - Add item to cart or create new cart
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const sessionId = getSessionId(request);

    // Validate required fields
    if (!body.product_id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    if (!body.quantity || body.quantity < 1) {
      return NextResponse.json(
        { error: 'Valid quantity is required' },
        { status: 400 }
      );
    }

    // Get product details
    const product = await Product.findById(body.product_id);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check stock
    if (product.stock < body.quantity) {
      return NextResponse.json(
        { error: 'Not enough stock available' },
        { status: 400 }
      );
    }

    // Find or create cart
    let cart = await Cart.findOne({ session_id: sessionId });

    if (!cart) {
      // Create new cart
      cart = await Cart.create({
        session_id: sessionId,
        items: [{
          product_id: product._id,
          product_name: product.product_name,
          product_image: product.images?.[0] || '',
          price: product.discounted_price,
          quantity: body.quantity,
          subtotal: product.discounted_price * body.quantity
        }]
      });
    } else {
      // Check if product already exists in cart
      const existingItemIndex = cart.items.findIndex(
        item => item.product_id.toString() === body.product_id
      );

      if (existingItemIndex > -1) {
        // Update quantity of existing item
        const newQuantity = cart.items[existingItemIndex].quantity + body.quantity;

        if (product.stock < newQuantity) {
          return NextResponse.json(
            { error: 'Not enough stock available' },
            { status: 400 }
          );
        }

        cart.items[existingItemIndex].quantity = newQuantity;
        cart.items[existingItemIndex].subtotal = cart.items[existingItemIndex].price * newQuantity;
      } else {
        // Add new item to cart
        cart.items.push({
          product_id: product._id,
          product_name: product.product_name,
          product_image: product.images?.[0] || '',
          price: product.discounted_price,
          quantity: body.quantity,
          subtotal: product.discounted_price * body.quantity
        });
      }

      await cart.save();
    }

    // Calculate totals
    await cart.calculateTotals();

    // Populate product details for response
    await cart.populate('items.product_id');

    return NextResponse.json(cart, { status: 201 });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { error: 'Failed to add to cart' },
      { status: 500 }
    );
  }
}

// PUT - Update cart (update item quantity, remove item, or clear cart)
export async function PUT(request) {
  try {
    await connectDB();
    const body = await request.json();
    const sessionId = getSessionId(request);

    let cart = await Cart.findOne({ session_id: sessionId });

    if (!cart) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      );
    }

    // Handle different update actions
    if (body.action === 'update_quantity') {
      // Update quantity of a specific item
      const { product_id, quantity } = body;

      if (!product_id || !quantity || quantity < 1) {
        return NextResponse.json(
          { error: 'Valid product ID and quantity are required' },
          { status: 400 }
        );
      }

      const itemIndex = cart.items.findIndex(
        item => item.product_id.toString() === product_id
      );

      if (itemIndex === -1) {
        return NextResponse.json(
          { error: 'Item not found in cart' },
          { status: 404 }
        );
      }

      // Check stock
      const product = await Product.findById(product_id);
      if (product && product.stock < quantity) {
        return NextResponse.json(
          { error: 'Not enough stock available' },
          { status: 400 }
        );
      }

      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].subtotal = cart.items[itemIndex].price * quantity;

    } else if (body.action === 'remove_item') {
      // Remove a specific item from cart
      const { product_id } = body;

      if (!product_id) {
        return NextResponse.json(
          { error: 'Product ID is required' },
          { status: 400 }
        );
      }

      cart.items = cart.items.filter(
        item => item.product_id.toString() !== product_id
      );

    } else if (body.action === 'clear_cart') {
      // Clear all items from cart
      cart.items = [];
    }

    // If cart is empty after operations, delete it
    if (cart.items.length === 0) {
      await Cart.deleteOne({ session_id: sessionId });
      return NextResponse.json({
        message: 'Cart cleared',
        session_id: sessionId,
        items: [],
        subtotal: 0,
        shipping_charge: 0,
        grand_total: 0
      });
    }

    // Calculate totals and save
    await cart.calculateTotals();

    // Populate product details for response
    await cart.populate('items.product_id');

    return NextResponse.json(cart);
  } catch (error) {
    console.error('Error updating cart:', error);
    return NextResponse.json(
      { error: 'Failed to update cart' },
      { status: 500 }
    );
  }
}

// DELETE - Remove entire cart
export async function DELETE(request) {
  try {
    await connectDB();
    const sessionId = getSessionId(request);

    await Cart.deleteOne({ session_id: sessionId });

    return NextResponse.json({
      message: 'Cart deleted successfully',
      session_id: sessionId
    });
  } catch (error) {
    console.error('Error deleting cart:', error);
    return NextResponse.json(
      { error: 'Failed to delete cart' },
      { status: 500 }
    );
  }
}
