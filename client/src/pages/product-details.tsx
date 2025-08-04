import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Heart, Star, ShoppingCart, Package, Tag, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BottomNavigation } from "@/components/bottom-navigation";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import type { Product } from "@shared/schema";
import { useState } from "react";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: ["/api/products", id],
    enabled: !!id,
  });

  const { data: favoriteData } = useQuery<{ isFavorite: boolean }>({
    queryKey: ["/api/favorites", id, "check"],
    enabled: !!id,
  });

  const isFavorite = favoriteData?.isFavorite || false;

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorite) {
        return apiRequest("DELETE", `/api/favorites/${id}`);
      } else {
        return apiRequest("POST", "/api/favorites", { productId: id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites", id, "check"] });
      toast({
        title: isFavorite ? "Removed from favorites" : "Added to favorites",
        description: isFavorite ? "Product removed from your favorites" : "Product added to your favorites",
      });
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/cart", { productId: id, quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: `${quantity} item(s) added to your cart`,
      });
    },
  });

  const handleBack = () => {
    navigate("/");
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen max-w-md mx-auto bg-white shadow-lg">
        <div className="animate-pulse">
          <div className="h-80 bg-gray-200" />
          <div className="p-4 space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded w-1/2" />
            <div className="h-20 bg-gray-200 rounded" />
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen max-w-md mx-auto bg-white shadow-lg">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Product not found</h3>
            <p className="text-sm text-gray-500 mb-4">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={handleBack} data-testid="button-back-to-products">
              Back to Products
            </Button>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  const priceInfo = formatPrice(product.price, product.originalPrice);

  return (
    <div className="min-h-screen max-w-md mx-auto bg-white shadow-lg relative pb-20">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="p-2 bg-white/80 hover:bg-white"
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleFavorite}
            disabled={toggleFavoriteMutation.isPending}
            className="p-2 bg-white/80 hover:bg-white"
            data-testid="button-favorite"
          >
            <Heart 
              className={cn(
                "h-5 w-5 transition-colors",
                isFavorite 
                  ? "fill-red-500 text-red-500" 
                  : "text-neutral-500 hover:text-red-500"
              )}
            />
          </Button>
        </div>
      </header>

      {/* Product Image */}
      <div className="relative">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-80 object-cover"
        />
        {priceInfo.discount > 0 && (
          <div className="absolute top-16 left-4">
            <Badge variant="destructive" className="text-sm font-medium">
              -{priceInfo.discount}% OFF
            </Badge>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-4 space-y-4">
        {/* Category and Brand */}
        <div className="flex items-center justify-between">
          <Badge 
            variant="secondary" 
            className={cn("text-sm font-medium", getCategoryColor(product.category))}
          >
            {product.category}
          </Badge>
          {product.brand && (
            <span className="text-sm text-neutral-500 font-medium">{product.brand}</span>
          )}
        </div>

        {/* Product Name */}
        <h1 className="text-2xl font-bold text-gray-900" data-testid="text-product-name">
          {product.name}
        </h1>

        {/* Rating and Reviews */}
        {product.rating && parseFloat(product.rating) > 0 && (
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <Star className="h-5 w-5 text-yellow-400 fill-current" />
              <span className="ml-1 font-medium text-gray-900" data-testid="text-product-rating">
                {product.rating}
              </span>
            </div>
            {product.reviewCount && product.reviewCount > 0 && (
              <span className="text-sm text-neutral-500" data-testid="text-product-reviews">
                ({product.reviewCount} reviews)
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center space-x-3">
          <span 
            className="text-3xl font-bold text-primary"
            data-testid="text-product-price"
          >
            {priceInfo.current}
          </span>
          {priceInfo.original && (
            <span className="text-lg text-gray-500 line-through">
              {priceInfo.original}
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div className="flex items-center space-x-2">
          <Package className="h-4 w-4 text-gray-500" />
          <span className={cn(
            "text-sm font-medium",
            product.stockQuantity > 0 ? "text-green-600" : "text-red-600"
          )} data-testid="text-stock-status">
            {product.stockQuantity > 0 
              ? `${product.stockQuantity} in stock` 
              : 'Out of stock'
            }
          </span>
        </div>

        {/* Description */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
          <p className="text-gray-600 leading-relaxed" data-testid="text-product-description">
            {product.description}
          </p>
        </div>

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Quantity and Add to Cart */}
        {product.stockQuantity > 0 && (
          <Card className="border border-gray-200 bg-gray-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium text-gray-900">Quantity</span>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    data-testid="button-decrease-quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-medium" data-testid="text-quantity">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                    disabled={quantity >= product.stockQuantity}
                    data-testid="button-increase-quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <Button
                className="w-full bg-primary text-white hover:bg-primary/90"
                onClick={handleAddToCart}
                disabled={addToCartMutation.isPending}
                data-testid="button-add-to-cart"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart - {formatPrice((parseFloat(product.price) * quantity).toString()).current}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}