import connectDB from "@/lib/db";
import Category from "@/models/Category";
import { NextResponse } from "next/server";

// GET all categories
export async function GET() {
  try {
    await connectDB();

    const categories = await Category.find({ is_active: true })
      .sort({ display_order: 1 })
      .lean();

    // Add "all products" category at the beginning
    const allCategories = [
      { name: "all products", slug: "all", emoji: "" },
      ...categories.map(cat => ({
        name: cat.name,
        slug: cat.slug,
        emoji: cat.emoji
      }))
    ];

    return NextResponse.json(allCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST create a new category
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    const category = await Category.create(body);

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
