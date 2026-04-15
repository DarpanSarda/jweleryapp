"use client";

import { Search, ShoppingCart, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getCart } from "@/lib/cart";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);

  // Load cart count from database
  useEffect(() => {
    const updateCartCount = async () => {
      try {
        const cart = await getCart();
        if (cart && cart.items) {
          const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
          setCartCount(count);
        } else {
          setCartCount(0);
        }
      } catch (error) {
        console.error('Error fetching cart count:', error);
        setCartCount(0);
      }
    };

    updateCartCount();

    // Listen for cart updates
    window.addEventListener("cart-updated", updateCartCount);

    return () => {
      window.removeEventListener("cart-updated", updateCartCount);
    };
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        // Dispatch custom event for ProductGrid to listen
        window.dispatchEvent(new CustomEvent("search-query", {
          detail: { query: searchQuery.trim() }
        }));
      } else if (searchQuery === "") {
        // Clear search when input is empty
        window.dispatchEvent(new CustomEvent("search-query", {
          detail: { query: "" }
        }));
      }
    }, 500); // 500ms debounce delay

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      {/* Top bar - Logo and Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold uppercase tracking-tight text-gray-900">
              vezura
            </h1>
          </div>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={(e) => e.preventDefault()} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full px-4 py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
              />
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
            </form>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart Icon */}
            <Link href="/checkout" className="relative p-2 text-gray-700 hover:text-gray-900 transition-colors">
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-700"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <form onSubmit={(e) => e.preventDefault()} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full px-4 py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
          </form>
        </div>
      </div>
    </header>
  );
}
