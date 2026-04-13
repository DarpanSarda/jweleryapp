"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";

export default function FeaturedProductsCarousel({ products, title }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    skipSnaps: false,
    dragFree: true,
    containScroll: "trimSnaps",
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(products);

  // Listen for search events
  useEffect(() => {
    const handleSearch = (event) => {
      setSearchQuery(event.detail.query);
    };

    window.addEventListener("search-query", handleSearch);

    return () => {
      window.removeEventListener("search-query", handleSearch);
    };
  }, []);

  // Filter products based on search query
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

  const updateNavigation = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    updateNavigation();
    emblaApi.on("select", updateNavigation);
    emblaApi.reInit();

    return () => {
      emblaApi.off("select", updateNavigation);
    };
  }, [emblaApi, updateNavigation, filteredProducts]);

  const scrollPrev = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollNext();
  }, [emblaApi]);

  if (!filteredProducts || filteredProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-8 px-4 bg-gradient-to-b from-pink-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            {title}
          </h2>

          {/* Navigation Buttons */}
          <div className="flex gap-2">
            <button
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className="bg-white border border-gray-300 hover:border-gray-400 text-gray-900 p-2 rounded-full shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110"
              aria-label="Previous products"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={scrollNext}
              disabled={!canScrollNext}
              className="bg-white border border-gray-300 hover:border-gray-400 text-gray-900 p-2 rounded-full shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110"
              aria-label="Next products"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="flex-[0_0_280px] min-w-0 md:flex-[0_0_320px]"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
