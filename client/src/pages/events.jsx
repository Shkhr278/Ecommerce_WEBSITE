// client/src/pages/events.jsx
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Home, Search, Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/product-card";
import { BottomNavigation } from "@/components/bottom-navigation";
import { TopNavigation } from "@/components/top-navigation";
import { useLocation } from "wouter";

export default function ProductsPage() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const filters = [
    { id: "all", label: "All Categories", type: "category" },
    { id: "technology", label: "Technology", type: "category" },
    { id: "science", label: "Science", type: "category" },
    { id: "education", label: "Education", type: "category" },
    { id: "lifestyle", label: "Lifestyle", type: "category" },
    { id: "under25", label: "Under $25", type: "price", maxPrice: 25 },
    { id: "under50", label: "Under $50", type: "price", maxPrice: 50 },
  ];

  // Build query parameters
  const queryParams = new URLSearchParams();
  if (searchQuery) queryParams.append("search", searchQuery);

  const activeFilterData = filters.find((f) => f.id === activeFilter);
  if (activeFilterData?.type === "category" && activeFilter !== "all") {
    // backend me category lower-case hai, isliye id ko hi bhej rahe hain
    queryParams.append("category", activeFilter);
  }
  if (activeFilterData?.type === "price") {
    queryParams.append("maxPrice", String(activeFilterData.maxPrice || ""));
  }

  const productsUrl =
    "/api/products" + (queryParams.toString() ? `?${queryParams.toString()}` : "");

  const {
    data: products = [],
    isLoading: productsLoading,
    error: productsError,
  } = useQuery({
    queryKey: [productsUrl],
  });

  const handleFilterClick = (filterId) => {
    setActiveFilter(filterId);
  };

  const handleViewDetails = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleLoadMore = () => {
    console.log("Load more products");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Full-width fixed top nav */}
      <TopNavigation />

      {/* Centered page content, padded below nav */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-20 lg:pb-8">
        {/* Header */}
        <header className=" top-16 z-10 bg-white/95 backdrop-blur border border-b border-gray-200 rounded-full px-4 py-3 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
          <div className="flex items-center space-x-3">
            <Home className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Topics</h1>
              <p className="text-xs text-gray-500">Discover curated topics and products</p>
            </div>
          </div>

          <div className="relative w-full sm:max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search topics or questions"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-full text-sm"
            />
          </div>
        </header>

        {/* Filter Section */}
        <section className="py-3">
          <div className="flex flex-wrap gap-3">
            {filters.map((filter) => (
              <Button
                key={filter.id}
                variant={activeFilter === filter.id ? "default" : "outline"}
                size="sm"
                className="rounded-full text-sm font-medium"
                onClick={() => handleFilterClick(filter.id)}
                data-testid={`button-filter-${filter.id}`}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </section>

        {/* Products Feed */}
        <main className="py-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Featured Topics</h2>
            <span
              className="text-sm text-gray-500"
              data-testid="text-products-count"
            >
              {products.length} topics
            </span>
          </div>

          {productsError && (
            <div className="text-center py-8">
              <p className="text-red-600 mb-2">Failed to load topics</p>
              <Button
                variant="outline"
                onClick={() =>
                  queryClient.invalidateQueries({ queryKey: [productsUrl] })
                }
                data-testid="button-retry-products"
              >
                Try Again
              </Button>
            </div>
          )}

          {productsLoading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-gray-200 rounded-2xl h-64 animate-pulse"
                />
              ))}
            </div>
          )}

          {!productsLoading && !productsError && products.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No topics found
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Try adjusting your search or filters to find more topics.
              </p>
            </div>
          )}

          {!productsLoading && !productsError && products.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>

              {/* Load More */}
              <div className="mt-8 text-center">
                <Button
                  variant="outline"
                  className="px-6 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200"
                  onClick={handleLoadMore}
                  data-testid="button-load-more"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Load More Topics
                </Button>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <BottomNavigation />
    </div>
  );
}
