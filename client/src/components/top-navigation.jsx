import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Store, ShoppingCart, Heart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function TopNavigation() {
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
    <nav className="hidden lg:flex fixed top-0 left-1/2 transform -translate-x-1/2 w-full responsive-container bg-white border-b border-gray-200 px-6 py-4 z-20">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-2">
          <Store className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-gray-900">E-Commerce</h1>
        </div>

        <div className="flex items-center space-x-1">
          {navItems.map(({ icon: Icon, label, path, testId, badge }) => {
            const isActive = location === path;

            return (
              <Link key={path} href={path}>
                <Button
                  variant="ghost"
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 h-auto transition-colors relative",
                    isActive ? "text-primary bg-primary/10" : "text-gray-600 hover:text-primary hover:bg-primary/5"
                  )}
                  data-testid={testId}
                >
                  <div className="relative">
                    <Icon className="h-5 w-5" />
                    {badge && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs p-0"
                      >
                        {badge > 9 ? "9+" : badge}
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm font-medium">{label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
