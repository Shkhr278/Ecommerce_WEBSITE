import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Store, Search, Filter, Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/product-card";
import { BottomNavigation } from "@/components/bottom-navigation";
import { TopNavigation } from "@/components/top-navigation";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import type { Product } from "@shared/schema";

export default function ProductsPage() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const filters = [
    { id: "all", label: "All Categories", type: "category" },
    { id: "electronics", label: "Electronics", type: "category" },
    { id: "clothing", label: "Clothing", type: "category" },
    { id: "furniture", label: "Furniture", type: "category" },
    { id: "sports & outdoors", label: "Sports", type: "category" },
    { id: "under25", label: "Under $25", type: "price", maxPrice: 25 },
    { id: "under50", label: "Under $50", type: "price", maxPrice: 50 },
  ];

  // Build query parameters
  const queryParams = new URLSearchParams();
  if (searchQuery) queryParams.append("search", searchQuery);

  const activeFilterData = filters.find(f => f.id === activeFilter);
  if (activeFilterData?.type === "category" && activeFilter !== "all") {
    queryParams.append("category", activeFilter);
  }
  if (activeFilterData?.type === "price") {
    queryParams.append("maxPrice", activeFilterData.maxPrice?.toString() || "");
  }

  const { 
    data: products = [], 
    isLoading: productsLoading, 
    error: productsError 
  } = useQuery<Product[]>({
    queryKey: ["/api/products?" + queryParams.toString()],
    enabled: true,
  });



  const handleFilterClick = (filterId: string) => {
    setActiveFilter(filterId);
  };

  const handleViewDetails = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const handleLoadMore = () => {
    // In a real app, you'd implement pagination
    console.log("Load more products");
  };

  return (
    <div className="min-h-screen responsive-container bg-white lg:shadow-lg relative">
      <TopNavigation />
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 sticky top-0 lg:top-20 z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Store className="text-primary h-5 w-5" />
            <div>
              <h1 className="text-lg lg:text-xl font-bold text-gray-900">Products</h1>
              <p className="text-xs text-neutral-500">Browse our catalog</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
            data-testid="button-filter-settings"
          >
            <Filter className="h-4 w-4 text-neutral-500" />
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white border-0"
            data-testid="input-search-products"
          />
        </div>
      </header>

      {/* Filter Section */}
      <section className="px-4 py-3 bg-white border-b border-gray-100">
        <div className="flex items-center space-x-3 overflow-x-auto pb-1">
          {filters.map((filter) => (
            <Button
              key={filter.id}
              variant={activeFilter === filter.id ? "default" : "secondary"}
              size="sm"
              className={cn(
                "flex-shrink-0 rounded-full text-sm font-medium transition-colors",
                activeFilter === filter.id
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
              onClick={() => handleFilterClick(filter.id)}
              data-testid={`button-filter-${filter.id}`}
            >
              {filter.id === "all" && <Filter className="mr-1 h-3 w-3" />}
              {filter.label}
            </Button>
          ))}
        </div>
      </section>

      {/* Products Feed */}
      <main className="flex-1 overflow-y-auto pb-20 lg:pb-4 custom-scrollbar">
        <div className="px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Featured Products</h2>
            <span className="text-sm text-neutral-500" data-testid="text-products-count">
              {products.length} products
            </span>
          </div>

          {productsError && (
            <div className="text-center py-8">
              <p className="text-red-600 mb-2">Failed to load products</p>
              <Button 
                variant="outline" 
                onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/products"] })}
                data-testid="button-retry-products"
              >
                Try Again
              </Button>
            </div>
          )}

          {productsLoading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-200 rounded-xl h-80 animate-pulse" />
              ))}
            </div>
          )}

          {!productsLoading && !productsError && products.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-sm text-gray-500 mb-4">
                Try adjusting your search or filters to find more products.
              </p>
            </div>
          )}

          {!productsLoading && !productsError && products.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {products.map((product: Product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>

              {/* Load More */}
              <div className="mt-6 text-center">
                <Button
                  variant="outline"
                  className="px-6 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200"
                  onClick={handleLoadMore}
                  data-testid="button-load-more"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Load More Products
                </Button>
              </div>
            </>
          )}
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
