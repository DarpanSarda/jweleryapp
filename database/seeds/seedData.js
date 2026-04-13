require('dotenv').config();
const mongoose = require('mongoose');
const { Category, Product, Customer } = require('../../src/models');

// Sample categories
const categories = [
  { category_name: 'Earrings', slug: 'earrings', emoji: '💎', description: 'Beautiful earrings for every occasion', display_order: 1 },
  { category_name: 'Rings', slug: 'rings', emoji: '💍', description: 'Elegant rings collection', display_order: 2 },
  { category_name: 'Necklace', slug: 'necklace', emoji: '📿', description: 'Stunning necklaces', display_order: 3 },
  { category_name: 'Bracelet', slug: 'bracelet', emoji: '⚪', description: 'Charming bracelets', display_order: 4 },
  { category_name: 'Hamper', slug: 'hamper', emoji: '🎁', description: 'Gift hampers and sets', display_order: 5 }
];

// Sample products
const products = [
  {
    product_name: 'Gold Plated Jhumka Earrings',
    slug: 'gold-plated-jhumka-earrings',
    short_description: 'Traditional gold-plated jhumka earrings',
    description: 'Beautiful gold-plated jhumka earrings with intricate design. Perfect for traditional occasions and festivals.',
    original_price: 1299,
    discounted_price: 899,
    discount_percentage: 31,
    main_image: '/images/products/earrings/jhumka-1.jpg',
    other_images: ['/images/products/earrings/jhumka-2.jpg', '/images/products/earrings/jhumka-3.jpg'],
    stock_quantity: 10,
    is_featured: true
  },
  {
    product_name: 'Silver Crystal Ring',
    slug: 'silver-crystal-ring',
    short_description: 'Elegant silver ring with crystal',
    description: 'Sterling silver ring featuring a sparkling crystal. Perfect for everyday wear.',
    original_price: 899,
    discounted_price: 599,
    discount_percentage: 33,
    main_image: '/images/products/rings/crystal-1.jpg',
    other_images: ['/images/products/rings/crystal-2.jpg'],
    stock_quantity: 15,
    is_featured: true
  },
  {
    product_name: 'Pearl Drop Necklace',
    slug: 'pearl-drop-necklace',
    short_description: 'Elegant pearl drop necklace',
    description: 'Classic pearl drop necklace on gold-plated chain. Timeless elegance for special occasions.',
    original_price: 2499,
    discounted_price: 1799,
    discount_percentage: 28,
    main_image: '/images/products/necklace/pearl-1.jpg',
    other_images: ['/images/products/necklace/pearl-2.jpg'],
    stock_quantity: 8,
    is_featured: true
  },
  {
    product_name: 'Charm Bracelet Set',
    slug: 'charm-bracelet-set',
    short_description: 'Beautiful charm bracelet with multiple charms',
    description: 'Gold-plated charm bracelet with decorative charms. Adjustable length for perfect fit.',
    original_price: 1099,
    discounted_price: 749,
    discount_percentage: 32,
    main_image: '/images/products/bracelet/charm-1.jpg',
    other_images: ['/images/products/bracelet/charm-2.jpg'],
    stock_quantity: 12
  },
  {
    product_name: 'Bridal Jewelry Hamper',
    slug: 'bridal-jewelry-hamper',
    short_description: 'Complete bridal jewelry set',
    description: 'Luxurious bridal jewelry hamper including earrings, necklace, and maang tikka. Perfect for weddings.',
    original_price: 5999,
    discounted_price: 4499,
    discount_percentage: 25,
    main_image: '/images/products/hamper/bridal-1.jpg',
    other_images: ['/images/products/hamper/bridal-2.jpg', '/images/products/hamper/bridal-3.jpg'],
    stock_quantity: 5,
    is_featured: true
  }
];

// Seed function
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vezura_db');
    console.log('MongoDB Connected for seeding...');

    // Clear existing data
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('Cleared existing data');

    // Insert categories
    const insertedCategories = await Category.insertMany(categories);
    console.log(`Inserted ${insertedCategories.length} categories`);

    // Insert products with category references
    const productsWithCategory = products.map((product, index) => ({
      ...product,
      category_id: insertedCategories[index % insertedCategories.length]._id
    }));

    const insertedProducts = await Product.insertMany(productsWithCategory);
    console.log(`Inserted ${insertedProducts.length} products`);

    console.log('Database seeded successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
