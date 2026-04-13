import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";
import mongoose from 'mongoose';

// GET single product by slug or id
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { slug } = await params;

    // Check if slug is a valid ObjectId
    const isValidObjectId = mongoose.Types.ObjectId.isValid(slug);

    // Search by _id if it's a valid ObjectId, otherwise search by slug
    const query = isValidObjectId ? { _id: slug } : { slug };

    const product = await Product.findOne(query)
      .populate('category_id')
      .lean();

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Transform product to match frontend structure
    const transformedProduct = {
      id: product._id.toString(),
      name: product.product_name,
      slug: product.slug || product._id.toString(),
      category: product.category_id?.name || 'Uncategorized',
      image: product.images?.[0] || '',
      images: product.images || [],
      price: product.discounted_price,
      originalPrice: product.original_price,
      isSold: product.is_sold || (product.stock === 0),
      emoji: product.category_id?.emoji || '',
      description: product.short_description,
      short_description: product.short_description,
      long_description: product.long_description,
      stock_quantity: product.stock,
      discount_percentage: product.discount_percentage
    };

    return NextResponse.json(transformedProduct);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
