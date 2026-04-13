import connectDB from "@/lib/db";
import Review from "@/models/Review";
import { NextResponse } from "next/server";

// GET all reviews (with optional product filter)
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id');

    let query = {};
    if (productId) {
      query.product_id = productId;
    }

    const reviews = await Review.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST create a new review
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    // Validate required fields
    if (!body.product_id || !body.user_name || !body.rating) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate rating range
    if (body.rating < 1 || body.rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    const review = await Review.create({
      product_id: body.product_id,
      user_name: body.user_name,
      rating: body.rating,
      review_text: body.review_text || ''
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}
