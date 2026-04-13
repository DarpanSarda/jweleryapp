import HeroCarousel from "@/components/HeroCarousel";
import FeaturedProductsCarousel from "@/components/FeaturedProductsCarousel";
import ProductGrid from "@/components/ProductGrid";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category"; // Import Category to ensure it's registered for populate

async function getProducts(filters = {}) {
  await connectDB();

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
  // Fetch featured products and all products in parallel
  const [featuredProducts, allProducts] = await Promise.all([
    getProducts({ featured: true }),
    getProducts()
  ]);

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

      {/* All Products Grid */}
      <ProductGrid products={allProducts} title="All Products" />
    </div>
  );
}
