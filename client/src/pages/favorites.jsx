import { useQuery } from "@tanstack/react-query";
import { Heart, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { BottomNavigation } from "@/components/bottom-navigation";
import { TopNavigation } from "@/components/top-navigation";
import { useLocation } from "wouter";

export default function FavoritesPage() {
  const [, navigate] = useLocation();

  const {
    data: favorites = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/favorites"],
  });

  const handleViewDetails = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className="min-h-screen max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 bg-white lg:shadow-lg relative lg:pt-16">
      <TopNavigation />

      {/* Header (below top nav on lg) */}
      <header className=" top-0 lg:top-16 z-10 bg-white border-b border-gray-200 py-4 px-3">
        <div className="flex items-center space-x-3">
          <Heart className="text-red-500 h-6 w-6" />
          <h1 className="text-xl font-bold text-gray-900">My Favorites</h1>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-20 custom-scrollbar">
        <div className="px-4 py-4">
          {isLoading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-gray-200 rounded-xl h-80 animate-pulse"
                />
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-600 mb-2">Failed to load favorites</p>
              <Button variant="outline" data-testid="button-retry-favorites">
                Try Again
              </Button>
            </div>
          )}

          {!isLoading && !error && favorites.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No favorites yet
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Start adding products to your favorites to see them here.
              </p>
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                data-testid="button-browse-products"
              >
                <Store className="mr-2 h-4 w-4" />
                Browse Products
              </Button>
            </div>
          )}

          {!isLoading && !error && favorites.length > 0 && (
            <>
              <div className="mb-4">
                <p
                  className="text-sm text-gray-600"
                  data-testid="text-favorites-count"
                >
                  {favorites.length} favorite
                  {favorites.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="space-y-4">
                {favorites.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
