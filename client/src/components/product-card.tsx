import { Heart, Star, ShoppingCart, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Product } from "@shared/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ProductCardProps {
  product: Product;
  onViewDetails: (productId: string) => void;
}

export function ProductCard({ product, onViewDetails }: ProductCardProps) {
  const queryClient = useQueryClient();

  const { data: favoriteData } = useQuery<{ isFavorite: boolean }>({
    queryKey: ["/api/favorites", product.id, "check"],
    enabled: !!product.id,
  });

  const isFavorite = favoriteData?.isFavorite || false;

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorite) {
        return apiRequest("DELETE", `/api/favorites/${product.id}`);
      } else {
        return apiRequest("POST", "/api/favorites", { productId: product.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites", product.id, "check"] });
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/cart", { productId: product.id, quantity: 1 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
  });

  const handleToggleFavorite = () => {
    toggleFavoriteMutation.mutate();
  };

  const handleAddToCart = () => {
    addToCartMutation.mutate();
  };

  const formatPrice = (price: string, originalPrice?: string | null) => {
    const currentPrice = parseFloat(price);
    const formattedPrice = `$${currentPrice.toFixed(2)}`;
    
    if (originalPrice && parseFloat(originalPrice) > currentPrice) {
      return {
        current: formattedPrice,
        original: `$${parseFloat(originalPrice).toFixed(2)}`,
        discount: Math.round(((parseFloat(originalPrice) - currentPrice) / parseFloat(originalPrice)) * 100)
      };
    }
    
    return { current: formattedPrice, original: null, discount: 0 };
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "electronics":
        return "bg-blue-100 text-blue-700";
      case "clothing":
        return "bg-purple-100 text-purple-700";
      case "furniture":
        return "bg-orange-100 text-orange-700";
      case "sports & outdoors":
        return "bg-green-100 text-green-700";
      case "home & garden":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const priceInfo = formatPrice(product.price, product.originalPrice);

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden fade-in">
      <div className="relative">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-40 object-cover"
          loading="lazy"
        />
        {priceInfo.discount > 0 && (
          <div className="absolute top-2 left-2">
            <Badge variant="destructive" className="text-xs font-medium">
              -{priceInfo.discount}%
            </Badge>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-1 h-auto hover:bg-white"
          onClick={handleToggleFavorite}
          disabled={toggleFavoriteMutation.isPending}
          data-testid={`button-favorite-${product.id}`}
        >
          <Heart 
            className={cn(
              "h-4 w-4 transition-colors",
              isFavorite 
                ? "fill-red-500 text-red-500" 
                : "text-neutral-500 hover:text-red-500"
            )}
          />
        </Button>
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <Badge 
            variant="secondary" 
            className={cn("text-xs font-medium", getCategoryColor(product.category))}
          >
            {product.category}
          </Badge>
          {product.brand && (
            <span className="text-xs text-neutral-500">{product.brand}</span>
          )}
        </div>
        
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2" data-testid={`text-product-name-${product.id}`}>
          {product.name}
        </h3>
        
        <div className="flex items-center mb-2">
          {product.rating && parseFloat(product.rating) > 0 && (
            <div className="flex items-center mr-2">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600 ml-1" data-testid={`text-product-rating-${product.id}`}>
                {product.rating}
              </span>
            </div>
          )}
          {product.reviewCount && product.reviewCount > 0 && (
            <span className="text-xs text-neutral-500" data-testid={`text-product-reviews-${product.id}`}>
              ({product.reviewCount} reviews)
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span 
              className="font-bold text-lg text-gray-900"
              data-testid={`text-product-price-${product.id}`}
            >
              {priceInfo.current}
            </span>
            {priceInfo.original && (
              <span className="text-sm text-gray-500 line-through">
                {priceInfo.original}
              </span>
            )}
          </div>
          <div className="text-xs text-neutral-500">
            {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2" data-testid={`text-product-description-${product.id}`}>
          {product.description}
        </p>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onViewDetails(product.id)}
            data-testid={`button-view-details-${product.id}`}
          >
            View Details
          </Button>
          <Button
            className="flex-1 bg-primary text-white hover:bg-primary/90"
            onClick={handleAddToCart}
            disabled={addToCartMutation.isPending || product.stockQuantity === 0}
            data-testid={`button-add-to-cart-${product.id}`}
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}