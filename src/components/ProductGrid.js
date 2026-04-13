"use client";

import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";

export default function ProductGrid({ products, title }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(products);

  useEffect(() => {
    // Listen for search events
    const handleSearch = (event) => {
      setSearchQuery(event.detail.query);
    };

    window.addEventListener("search-query", handleSearch);

    return () => {
      window.removeEventListener("search-query", handleSearch);
    };
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = products.filter((product) => {
        return (
          product.name.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query)
        );
      });
      setFilteredProducts(filtered);
    }
  }, [searchQuery, products]);

  if (!filteredProducts || filteredProducts.length === 0) {
    return (
      <div className="text-center py-12">
        {searchQuery ? (
          <div>
            <p className="text-gray-600 mb-2">No products found for "{searchQuery}"</p>
            <p className="text-sm text-gray-500">Try a different search term</p>
          </div>
        ) : (
          <p className="text-gray-600">No products found.</p>
        )}
      </div>
    );
  }

  return (
    <section className="py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        {title && (
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
            {title}
          </h2>
        )}

        {/* Search Result Indicator */}
        {searchQuery && (
          <div className="mb-6 text-center">
            <p className="text-gray-600">
              Showing {filteredProducts.length} result{filteredProducts.length !== 1 ? "s" : ""} for "{searchQuery}"
            </p>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
