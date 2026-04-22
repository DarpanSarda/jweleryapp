import HeroCarousel from "@/components/HeroCarousel";
import FeaturedProductsCarousel from "@/components/FeaturedProductsCarousel";
import FilterableProducts from "@/components/FilterableProducts";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";

// Force dynamic rendering to avoid build-time database connection issues
export const dynamic = 'force-dynamic';

async function getProducts(filters = {}) {
  await connectDB();

  // Log database connection
  console.log("Fetching products with filters:", filters);

  // Query for products that are NOT sold (either is_sold is false or doesn't exist)
  let query = { is_sold: { $ne: true } };

  // Filter by featured - use $and to combine conditions
  if (filters.featured) {
    query = {
      $and: [
        { is_sold: { $ne: true } },
        { is_featured: true }
      ]
    };
  }

  const products = await Product.find(query)
    .populate('category_id')
    .sort({ createdAt: -1 })
    .lean();

  // Transform products to match frontend structure
  return products.map(product => ({
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
}

export default async function Home() {
  // Ensure database connection is established
  await connectDB();

  // Fetch featured products, all products, and categories in parallel
  const [featuredProducts, allProducts, categories] = await Promise.all([
    getProducts({ featured: true }),
    getProducts(),
    Category.find().sort({ display_order: 1 }).lean()
  ]);

  console.log("Raw categories from DB:", categories);
  console.log("Categories count:", categories?.length);

  // Serialize categories for client component
  const serializedCategories = categories.map(cat => ({
    _id: cat._id.toString(),
    name: cat.name,
    slug: cat.slug,
    emoji: cat.emoji,
    description: cat.description
  }));

  console.log("Serialized categories:", serializedCategories);
  console.log("Serialized categories count:", serializedCategories.length);

  return (
    <div className="min-h-screen">
      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Featured Products Carousel */}
      <FeaturedProductsCarousel
        products={featuredProducts}
        title="✨ Featured Products"
      />

      {/* Welcome Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Welcome to vezura
          </h2>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            Discover our stunning collection of handcrafted jewelry. From elegant
            necklaces to sparkling earrings, find the perfect piece for every
            occasion.
          </p>
        </div>
      </section>

      {/* All Products with Filters */}
      <FilterableProducts
        initialProducts={allProducts}
        categories={serializedCategories}
      />
    </div>
  );
}
