import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { NextResponse } from "next/server";

// GET all products (with optional filtering)
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');

    // Build query conditions
    let conditions = [{ is_sold: { $ne: true } }];

    // Filter by category
    if (category && category !== 'all') {
      const categoryDoc = await Category.findOne({ name: category });
      if (categoryDoc) {
        conditions.push({ category_id: categoryDoc._id });
      }
    }

    // Filter by featured
    if (featured === 'true') {
      conditions.push({ is_featured: true });
    }

    // Build final query
    let query = conditions.length === 1 ? conditions[0] : { $and: conditions };

    // Search functionality
    if (search) {
      const searchConditions = [
        { product_name: { $regex: search, $options: 'i' } },
        { long_description: { $regex: search, $options: 'i' } },
        { short_description: { $regex: search, $options: 'i' } }
      ];

      // If we already have conditions, combine with search using $and
      if (conditions.length > 1) {
        query = {
          $and: [
            ...conditions,
            { $or: searchConditions }
          ]
        };
      } else {
        query = {
          $and: [
            conditions[0],
            { $or: searchConditions }
          ]
        };
      }
    }

    const products = await Product.find(query)
      .populate('category_id')
      .sort({ createdAt: -1 })
      .lean();

    // Transform products to match frontend structure
    const transformedProducts = products.map(product => ({
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
    }));

    return NextResponse.json(transformedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST create a new product
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    const product = await Product.create(body);

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
