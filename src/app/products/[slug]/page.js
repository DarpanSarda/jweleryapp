"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShoppingCart, Share2, Star, Check, Truck, Shield, RotateCcw } from "lucide-react";
import { fetchProductBySlug } from "@/lib/products";
import { addToCart, getCart } from "@/lib/cart";
import BuyNowModal from "@/components/BuyNowModal";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showAddedToCart, setShowAddedToCart] = useState(false);
  const [showBuyNowModal, setShowBuyNowModal] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [cartQuantity, setCartQuantity] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    user_name: '',
    rating: 5,
    review_text: ''
  });
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewError, setReviewError] = useState('');

  // Fetch product by slug
  useEffect(() => {
    async function loadProduct() {
      const data = await fetchProductBySlug(params.slug);
      if (data) {
        setProduct(data);
        // Set initial quantity based on stock
        const initialQty = data.stock_quantity > 0 ? 1 : 0;
        setQuantity(initialQty);
      } else {
        // Product not found - could redirect to 404
        console.error('Product not found');
      }
      setLoading(false);
    }

    loadProduct();
  }, [params.slug]);

  // Fetch reviews when product is loaded
  useEffect(() => {
    async function loadReviews() {
      if (!product?.id) return;

      setReviewsLoading(true);
      try {
        const response = await fetch(`/api/reviews?product_id=${product.id}`);
        if (response.ok) {
          const data = await response.json();
          setReviews(data);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setReviewsLoading(false);
      }
    }

    loadReviews();
  }, [product?.id]);

  // Check if product is in cart
  useEffect(() => {
    async function checkCart() {
      if (!product?.id) return;

      try {
        const cart = await getCart();
        if (cart && cart.items) {
          const cartItem = cart.items.find(item => item.product_id === product.id);
          setIsInCart(!!cartItem);
          setCartQuantity(cartItem?.quantity || 0);
        } else {
          setIsInCart(false);
          setCartQuantity(0);
        }
      } catch (error) {
        console.error('Error checking cart:', error);
        setIsInCart(false);
      }
    }

    checkCart();

    // Listen for cart updates
    const handleCartUpdate = () => {
      checkCart();
    };

    window.addEventListener('cart-updated', handleCartUpdate);

    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate);
    };
  }, [product?.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-pink-500 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  // Get product images from API response
  const productImages = product.images || [product.image];

  // Calculate discount percentage
  const discount = product.discount_percentage ||
    (product.originalPrice
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0);

  const handleAddToCart = async () => {
    try {
      await addToCart(product.id, quantity);

      // Trigger cart update event for Header
      window.dispatchEvent(new Event("cart-updated"));

      setShowAddedToCart(true);
      setTimeout(() => setShowAddedToCart(false), 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert(error.message || 'Failed to add to cart');
    }
  };

  const handleBuyNow = () => {
    setShowBuyNowModal(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');

    // Validate form
    if (!reviewForm.user_name.trim()) {
      setReviewError('Please enter your name');
      return;
    }

    if (!reviewForm.rating || reviewForm.rating < 1 || reviewForm.rating > 5) {
      setReviewError('Please select a rating');
      return;
    }

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: product.id,
          user_name: reviewForm.user_name,
          rating: reviewForm.rating,
          review_text: reviewForm.review_text
        }),
      });

      if (response.ok) {
        const newReview = await response.json();
        setReviewSubmitted(true);
        setReviewForm({ user_name: '', rating: 5, review_text: '' });
        // Add the new review to the reviews list
        setReviews(prevReviews => [newReview, ...prevReviews]);
        setTimeout(() => setReviewSubmitted(false), 3000);
      } else {
        const error = await response.json();
        setReviewError(error.error || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      setReviewError('Failed to submit review. Please try again.');
    }
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                Home
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <Link
                href={`/${product.category.toLowerCase()}`}
                className="text-gray-500 hover:text-gray-700"
              >
                {product.category}
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 font-medium">{product.name}</li>
          </ol>
        </div>
      </nav>

      {/* Product Details Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square bg-white rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src={productImages[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />

                {/* SOLD Badge */}
                {product.isSold && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full text-lg font-semibold">
                    SOLD
                  </div>
                )}

                {/* Discount Badge */}
                {!product.isSold && discount > 0 && (
                  <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-2 rounded-full text-sm font-semibold">
                    {discount}% OFF
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              <div className="grid grid-cols-3 gap-4">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square bg-white rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? "border-pink-500 shadow-lg"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 33vw, 16vw"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Category */}
              <div className="flex items-center justify-between">
                <span className="inline-block bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm font-medium">
                  {product.category} {product.emoji}
                </span>
                {/* Share */}
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <Share2 size={24} className="text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={i < Math.floor(calculateAverageRating() || 4) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  ({calculateAverageRating() || '4.0'}) · {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-gray-900">
                  ₹{product.price}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      ₹{product.originalPrice}
                    </span>
                    <span className="text-lg font-semibold text-green-600">
                      Save ₹{Math.round(product.originalPrice - product.price)}
                    </span>
                  </>
                )}
              </div>

              {/* Short Description */}
              <div className="prose prose-gray">
                <p className="text-gray-700 leading-relaxed">
                  {product.short_description || product.description || 'No description available.'}
                </p>
              </div>

              {/* Stock Status */}
              {product.stock_quantity > 0 ? (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded-lg">
                  <p className="text-sm font-medium">
                    Only {product.stock_quantity} {product.stock_quantity === 1 ? 'item' : 'items'} left in stock!
                  </p>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded-lg">
                  <p className="text-sm font-medium">Out of stock</p>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <span className="text-gray-700 font-medium">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                    disabled={product.stock_quantity === 0}
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-gray-900 font-medium min-w text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock_quantity || 1, quantity + 1))}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={quantity >= (product.stock_quantity || 0)}
                  >
                    +
                  </button>
                </div>
                {product.stock_quantity > 0 && (
                  <span className="text-sm text-gray-500">
                    (Max: {product.stock_quantity})
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                {!product.isSold ? (
                  <>
                    {isInCart ? (
                      <button
                        disabled
                        className="flex-1 bg-green-600 text-white py-4 px-8 rounded-full font-semibold cursor-default flex items-center justify-center gap-2"
                      >
                        <Check size={24} />
                        In Cart ({cartQuantity})
                      </button>
                    ) : (
                      <button
                        onClick={handleAddToCart}
                        className="flex-1 bg-gray-900 text-white py-4 px-8 rounded-full font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                      >
                        <ShoppingCart size={24} />
                        Add to Cart
                      </button>
                    )}
                    <button
                      onClick={handleBuyNow}
                      className="px-6 py-4 border-2 border-gray-900 text-gray-900 rounded-full font-semibold hover:bg-gray-900 hover:text-white transition-colors"
                    >
                      Buy Now
                    </button>
                  </>
                ) : (
                  <button
                    disabled
                    className="flex-1 bg-gray-300 text-gray-500 py-4 px-8 rounded-full font-semibold cursor-not-allowed"
                  >
                    Out of Stock
                  </button>
                )}
              </div>

              {/* Success Message */}
              {showAddedToCart && (
                <div className="bg-green-100 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2 animate-fade-in">
                  <Check size={20} />
                  <span>Added to cart successfully!</span>
                </div>
              )}

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <Truck size={24} className="text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">Free Shipping</p>
                    <p className="text-sm text-gray-600">On orders over ₹999</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield size={24} className="text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">Secure Payment</p>
                    <p className="text-sm text-gray-600">100% secure checkout</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <RotateCcw size={24} className="text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">Easy Returns</p>
                    <p className="text-sm text-gray-600">7 days return policy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Details Tabs */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="border-b border-gray-200">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab('description')}
                className={`pb-4 border-b-2 font-medium transition-colors ${
                  activeTab === 'description'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-4 border-b-2 font-medium transition-colors ${
                  activeTab === 'reviews'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Reviews ({reviews.length})
              </button>
              <button
                onClick={() => setActiveTab('shipping')}
                className={`pb-4 border-b-2 font-medium transition-colors ${
                  activeTab === 'shipping'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Shipping
              </button>
            </div>
          </div>

          <div className="py-8">
            {activeTab === 'description' && (
              <>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Product Description
                </h3>
                <div className="prose prose-gray max-w-none">
                  {product.long_description ? (
                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {product.long_description}
                    </div>
                  ) : (
                    <p className="text-gray-500">No detailed description available.</p>
                  )}
                </div>

                {/* Product Metadata */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-6 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Category</p>
                    <p className="font-medium text-gray-900">{product.category} {product.emoji}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Availability</p>
                    <p className={`font-medium ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
                    </p>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Review Form */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Write a Review
                    </h3>
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Your Name *
                        </label>
                        <input
                          type="text"
                          value={reviewForm.user_name}
                          onChange={(e) => setReviewForm({ ...reviewForm, user_name: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                          placeholder="Enter your name"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Rating *
                        </label>
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                              className="transition-transform hover:scale-110"
                            >
                              <Star
                                size={24}
                                className={star <= reviewForm.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                              />
                            </button>
                          ))}
                          <span className="ml-2 text-sm text-gray-600">
                            {reviewForm.rating} / 5
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Your Review
                        </label>
                        <textarea
                          value={reviewForm.review_text}
                          onChange={(e) => setReviewForm({ ...reviewForm, review_text: e.target.value })}
                          rows="4"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                          placeholder="Share your thoughts about this product..."
                        />
                      </div>

                      {reviewError && (
                        <div className="bg-red-50 text-red-800 px-4 py-2 rounded-lg text-sm">
                          {reviewError}
                        </div>
                      )}

                      {reviewSubmitted && (
                        <div className="bg-green-50 text-green-800 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                          <Check size={16} />
                          <span>Review submitted successfully!</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                      >
                        Submit Review
                      </button>
                    </form>
                  </div>

                  {/* Reviews List */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Customer Reviews
                    </h3>
                    {reviewsLoading ? (
                      <div className="text-center py-8">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-pink-500 border-r-transparent"></div>
                        <p className="mt-2 text-gray-600">Loading reviews...</p>
                      </div>
                    ) : reviews.length > 0 ? (
                      <div className="space-y-4 max-h-125 overflow-y-auto">
                        {reviews.map((review) => (
                          <div key={review._id} className="bg-white border border-gray-200 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      size={16}
                                      className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                  {review.rating}/5
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="font-medium text-gray-900 mb-1">{review.user_name}</p>
                            {review.review_text && (
                              <p className="text-gray-700 text-sm">{review.review_text}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Shipping Information
                </h3>
                <div className="prose prose-gray max-w-none">
                  <div className="space-y-4 text-gray-700">
                    <div className="flex items-start gap-4">
                      <Truck size={24} className="text-gray-600 mt-1" />
                      <div>
                        <p className="font-medium text-gray-900">Free Shipping</p>
                        <p>We offer free shipping on all orders over ₹999. Standard delivery takes 3-5 business days.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <Shield size={24} className="text-gray-600 mt-1" />
                      <div>
                        <p className="font-medium text-gray-900">Secure Packaging</p>
                        <p>All items are carefully packaged in premium jewelry boxes to ensure they arrive in perfect condition.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <RotateCcw size={24} className="text-gray-600 mt-1" />
                      <div>
                        <p className="font-medium text-gray-900">Easy Returns</p>
                        <p>Not satisfied? Return within 7 days for a full refund. Items must be unused and in original packaging.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Buy Now Modal */}
      {showBuyNowModal && (
        <BuyNowModal
          product={product}
          initialQuantity={quantity}
          onClose={() => setShowBuyNowModal(false)}
        />
      )}
    </div>
  );
}
