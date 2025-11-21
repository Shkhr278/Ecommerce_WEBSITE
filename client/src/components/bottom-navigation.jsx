import { Store, ShoppingCart, Heart, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

export function BottomNavigation() {
  const [location] = useLocation();

  const { data: cartItems = [] } = useQuery({
    queryKey: ["/api/cart"],
  });

  const cartItemCount = Array.isArray(cartItems) ? cartItems.length : 0;

  const navItems = [
    { icon: Store, label: "Products", path: "/", testId: "nav-products" },
    { icon: ShoppingCart, label: "Cart", path: "/cart", testId: "nav-cart", badge: cartItemCount > 0 ? cartItemCount : null },
    { icon: Heart, label: "Favorites", path: "/favorites", testId: "nav-favorites" },
    { icon: User, label: "Profile", path: "/profile", testId: "nav-profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full responsive-container bg-white border-t border-gray-200 px-4 py-2 z-10 lg:hidden">
      <div className="flex items-center justify-around">
        {navItems.map(({ icon: Icon, label, path, testId, badge }) => {
          const isActive = location === path;

          return (
            <Link key={path} href={path}>
              <Button
                variant="ghost"
                className={cn(
                  "flex flex-col items-center py-2 px-3 h-auto min-w-0 transition-colors relative",
                  isActive ? "text-primary" : "text-neutral-500 hover:text-primary"
                )}
                data-testid={testId}
              >
                <div className="relative">
                  <Icon className="h-5 w-5 mb-1" />
                  {badge && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {badge > 9 ? "9+" : badge}
                    </div>
                  )}
                </div>
                <span className="text-xs font-medium">{label}</span>
              </Button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
