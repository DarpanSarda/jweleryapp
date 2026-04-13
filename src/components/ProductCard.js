"use client";

import Image from "next/image";
import Link from "next/link";
import { Eye, ShoppingCart, Check } from "lucide-react";
import { useState } from "react";
import { addToCart } from "@/lib/cart";

export default function ProductCard({ product }) {
  const [showAddedToCart, setShowAddedToCart] = useState(false);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await addToCart(product.id, 1);

      // Trigger cart update event for Header
      window.dispatchEvent(new Event("cart-updated"));

      // Show success feedback
      setShowAddedToCart(true);
      setTimeout(() => setShowAddedToCart(false), 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Could show an error toast here
      alert(error.message || 'Failed to add to cart');
    }
  };

  // For sold out products, render without Link wrapper
  if (product.isSold) {
    return (
      <div className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden opacity-75">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover grayscale"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* SOLD Badge */}
          <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            SOLD OUT
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="text-base font-medium text-gray-900 mb-2 line-clamp-2">
            {product.name} {product.emoji}
          </h3>

          {/* Prices */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">
              ₹{product.price}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                ₹{product.originalPrice}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // For available products, render with Link wrapper
  return (
    <Link href={`/products/${product.slug}`}>
      <div className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Discount Badge */}
          {discount > 0 && (
            <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
              {discount}% OFF
            </div>
          )}

          {/* View Details Button - Shows on Hover */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <button className="bg-white text-gray-900 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2">
              <Eye size={18} />
              View Details
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="text-base font-medium text-gray-900 mb-2 line-clamp-2">
            {product.name} {product.emoji}
          </h3>

          {/* Prices */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">
                ₹{product.price}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  ₹{product.originalPrice}
                </span>
              )}
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={showAddedToCart}
            className={`w-full py-2 px-4 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
              showAddedToCart
                ? 'bg-green-100 text-green-700 cursor-default'
                : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
          >
            {showAddedToCart ? (
              <>
                <Check size={16} />
                Added!
              </>
            ) : (
              <>
                <ShoppingCart size={16} />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}
