import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ShoppingCart, Minus, Plus, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BottomNavigation } from "@/components/bottom-navigation";
import { TopNavigation } from "@/components/top-navigation";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import type { CartItem, Product } from "@shared/schema";

type CartItemWithProduct = CartItem & { product: Product };

export default function CartPage() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const { data: cartItems = [], isLoading, error } = useQuery<CartItemWithProduct[]>({
    queryKey: ["/api/cart"],
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      return apiRequest("PUT", `/api/cart/${productId}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (productId: string) => {
      return apiRequest("DELETE", `/api/cart/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
  });

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantityMutation.mutate({ productId, quantity: newQuantity });
  };

  const removeItem = (productId: string) => {
    removeItemMutation.mutate(productId);
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (parseFloat(item.product.price) * item.quantity);
    }, 0);
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  const handleGoBack = () => {
    navigate("/");
  };

  const handleCheckout = () => {
    // In a real app, this would navigate to checkout
    console.log("Proceed to checkout");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen max-w-md mx-auto bg-white shadow-lg relative">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen responsive-container bg-white lg:shadow-lg relative pb-20 lg:pb-4">
      <TopNavigation />
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 sticky top-0 lg:top-20 z-10">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGoBack}
            className="p-2"
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold text-gray-900">Shopping Cart</h1>
          </div>
          <div className="w-9" /> {/* Spacer for center alignment */}
        </div>
      </header>

      {/* Cart Content */}
      <main className="px-4 py-4 flex-1">
        {error && (
          <div className="text-center py-8">
            <p className="text-red-600 mb-2">Failed to load cart</p>
            <Button 
              variant="outline" 
              onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/cart"] })}
              data-testid="button-retry-cart"
            >
              Try Again
            </Button>
          </div>
        )}

        {!error && cartItems.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-sm text-gray-500 mb-4">
              Add some products to get started!
            </p>
            <Button 
              onClick={handleGoBack}
              data-testid="button-continue-shopping"
            >
              Continue Shopping
            </Button>
          </div>
        )}

        {!error && cartItems.length > 0 && (
          <>
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <Card key={item.id} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex space-x-3">
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate" data-testid={`text-product-name-${item.product.id}`}>
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">
                          {item.product.category}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-bold text-primary" data-testid={`text-product-price-${item.product.id}`}>
                            {formatPrice(parseFloat(item.product.price))}
                          </span>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="p-1 h-8 w-8"
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              disabled={updateQuantityMutation.isPending || item.quantity <= 1}
                              data-testid={`button-decrease-quantity-${item.product.id}`}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium" data-testid={`text-quantity-${item.product.id}`}>
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="p-1 h-8 w-8"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              disabled={updateQuantityMutation.isPending}
                              data-testid={`button-increase-quantity-${item.product.id}`}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-1 h-8 w-8 text-red-500 hover:text-red-700"
                              onClick={() => removeItem(item.product.id)}
                              disabled={removeItemMutation.isPending}
                              data-testid={`button-remove-item-${item.product.id}`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <Card className="border border-gray-200 bg-gray-50">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({cartItems.length} items)</span>
                    <span className="font-medium" data-testid="text-subtotal">
                      {formatPrice(calculateTotal())}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Total</span>
                      <span className="font-bold text-lg text-primary" data-testid="text-total">
                        {formatPrice(calculateTotal())}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  className="w-full mt-4 bg-primary text-white hover:bg-primary/90"
                  onClick={handleCheckout}
                  data-testid="button-checkout"
                >
                  Proceed to Checkout
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}