import ProductGrid from "@/components/ProductGrid";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Link from "next/link";

// Force dynamic rendering to avoid build-time database connection issues
export const dynamic = 'force-dynamic';

async function getProductsByCategory(slug) {
  await connectDB();

  // If slug is "all", return all products
  if (slug === "all") {
    const products = await Product.find({ is_sold: { $ne: true } })
      .populate('category_id')
      .sort({ createdAt: -1 })
      .lean();

    return {
      products: products.map(product => ({
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
      })),
      title: "All Products",
      emoji: ""
    };
  }

  // Find category by slug
  const category = await Category.findOne({ slug, is_active: true });

  if (!category) {
    return null;
  }

  // Fetch products in this category
  const products = await Product.find({
    category_id: category._id,
    is_sold: { $ne: true }
  })
    .populate('category_id')
    .sort({ createdAt: -1 })
    .lean();

  return {
    products: products.map(product => ({
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
    })),
    title: category.name,
    emoji: category.emoji
  };
}

export default async function CategoryPage({ params }) {
  const data = await getProductsByCategory(params.slug);

  // Category not found
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h1>
          <p className="text-gray-600 mb-6">The category you're looking for doesn't exist.</p>
          <Link
            href="/"
            className="inline-block bg-gray-900 text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Category Header */}
      <section className="py-12 px-4 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {data.title} {data.emoji}
          </h1>
          {data.products.length > 0 && (
            <p className="text-gray-600">
              Showing {data.products.length} product{data.products.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </section>

      {/* Products Grid */}
      <ProductGrid products={data.products} title={null} />
    </div>
  );
}
