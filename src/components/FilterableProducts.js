"use client";

import { useState, useEffect, useRef } from "react";
import ProductCard from "./ProductCard";

export default function FilterableProducts({ initialProducts, categories = [] }) {
  const [products, setProducts] = useState(initialProducts);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortBy, setSortBy] = useState("newest");
  const [filteredProducts, setFilteredProducts] = useState(initialProducts);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setIsCategoryDropdownOpen(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setIsSortDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter and sort products
  useEffect(() => {
    let filtered = [...products];

    // Filter by categories (multiple selection)
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((product) =>
        selectedCategories.includes(product.category)
      );
    }

    // Sort products
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        // Keep original order (already sorted by createdAt)
        break;
      case "name-asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  }, [selectedCategories, sortBy, products]);

  const handleCategoryToggle = (categoryName) => {
    setSelectedCategories((prev) => {
      if (categoryName === null) {
        // "All Products" clears all selections
        return [];
      }
      if (prev.includes(categoryName)) {
        return prev.filter((c) => c !== categoryName);
      } else {
        return [...prev, categoryName];
      }
    });
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSortBy("newest");
  };

  const getCategoryLabel = () => {
    if (selectedCategories.length === 0) return "All Categories";
    if (selectedCategories.length === 1) return selectedCategories[0];
    return `${selectedCategories.length} Categories Selected`;
  };

  const getSortLabel = () => {
    const sortOptions = [
      { value: "newest", label: "Newest First" },
      { value: "price-low", label: "Price: Low to High" },
      { value: "price-high", label: "Price: High to Low" },
      { value: "name-asc", label: "Name: A to Z" },
    ];
    return sortOptions.find((o) => o.value === sortBy)?.label || "Sort By";
  };

  return (
    <section className="py-12 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Filters */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-between"
              >
                <span>Filters & Sort</span>
                <svg
                  className={`w-5 h-5 transition-transform ${
                    isMobileFilterOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>

            {/* Filter Panel */}
            <div
              className={`${
                isMobileFilterOpen ? "block" : "hidden"
              } lg:block bg-white rounded-xl p-6 shadow-sm`}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Filters</h3>
                {(selectedCategories.length > 0 || sortBy !== "newest") && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-pink-600 hover:text-pink-700 font-medium"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Category Dropdown */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                  Categories
                </h4>
                <div className="relative" ref={categoryDropdownRef}>
                  <button
                    onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-900">
                      {getCategoryLabel()}
                    </span>
                    <svg
                      className={`w-5 h-5 text-gray-500 transition-transform ${
                        isCategoryDropdownOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Dropdown Content */}
                  {isCategoryDropdownOpen && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                      <div className="p-2">
                        {/* All Products Option */}
                        <label className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedCategories.length === 0}
                            onChange={() => handleCategoryToggle(null)}
                            className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                          />
                          <span className="text-sm text-gray-700">All Products</span>
                        </label>

                        {/* Category Options */}
                        {categories && categories.length > 0 ? (
                          categories.map((category) => (
                            <label
                              key={category._id}
                              className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedCategories.includes(category.name)}
                                onChange={() => handleCategoryToggle(category.name)}
                                className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                              />
                              <span className="text-sm text-gray-700">
                                {category.name} {category.emoji}
                              </span>
                            </label>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 px-3 py-2">No categories available</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sort By Dropdown */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                  Sort By
                </h4>
                <div className="relative" ref={sortDropdownRef}>
                  <button
                    onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-900">
                      {getSortLabel()}
                    </span>
                    <svg
                      className={`w-5 h-5 text-gray-500 transition-transform ${
                        isSortDropdownOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Dropdown Content */}
                  {isSortDropdownOpen && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                      <div className="p-2">
                        {[
                          { value: "newest", label: "Newest First" },
                          { value: "price-low", label: "Price: Low to High" },
                          { value: "price-high", label: "Price: High to Low" },
                          { value: "name-asc", label: "Name: A to Z" },
                        ].map((option) => (
                          <label
                            key={option.value}
                            className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                          >
                            <input
                              type="radio"
                              name="sort"
                              checked={sortBy === option.value}
                              onChange={() => setSortBy(option.value)}
                              className="w-4 h-4 text-pink-600 border-gray-300 focus:ring-pink-500"
                            />
                            <span className="text-sm text-gray-700">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Active Filters Display */}
              {(selectedCategories.length > 0 || sortBy !== "newest") && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    Active Filters
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCategories.map((cat) => (
                      <span
                        key={cat}
                        className="inline-flex items-center gap-1 bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {cat}
                        <button
                          onClick={() => handleCategoryToggle(cat)}
                          className="hover:text-pink-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    {sortBy !== "newest" && (
                      <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                        {getSortLabel()}
                        <button
                          onClick={() => setSortBy("newest")}
                          className="hover:text-gray-900"
                        >
                          ×
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedCategories.length > 0
                  ? selectedCategories.join(", ")
                  : "All Products"}
              </h2>
              <p className="text-gray-600">
                {filteredProducts.length} product
                {filteredProducts.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Products */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl">
                <p className="text-gray-600">No products found.</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 text-pink-600 hover:text-pink-700 font-medium"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
