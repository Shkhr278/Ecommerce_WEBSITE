import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Menu,
  Home,
  Bell,
  User,
  ShoppingCart,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function TopNavigation() {
  const [location] = useLocation();

  // Notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ["/api/notifications"],
  });
  const notificationsCount = Array.isArray(notifications)
    ? notifications.length
    : 0;

  // Cart items
  const { data: cartItems = [] } = useQuery({
    queryKey: ["/api/cart"],
  });
  const cartItemCount = Array.isArray(cartItems) ? cartItems.length : 0;

  const navItems = [
    { icon: Home, label: "Home", path: "/", testId: "nav-home" },
    {
      icon: ShoppingCart,
      label: "Cart",
      path: "/cart",
      testId: "nav-cart",
      badge: cartItemCount > 0 ? cartItemCount : null,
    },
    {
      icon: Heart,
      label: "Favorites",
      path: "/favorites",
      testId: "nav-favorites",
    },
    {
      icon: Bell,
      label: "Notifications",
      path: "/notifications",
      testId: "nav-notifications",
      badge: notificationsCount > 0 ? notificationsCount : null,
    },
    
    { icon: User, label: "Profile", path: "/profile", testId: "nav-profile" },
  ];

  return (
    <nav className="hidden lg:flex fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-6 py-2 shadow-sm z-20">
      <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" className="p-2">
            <Menu className="h-6 w-6 text-gray-700" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-900 cursor-pointer">
            Local Spark
          </h1>
        </div>

        <div className="flex space-x-6">
          {navItems.map(({ icon: Icon, label, path, testId, badge }) => {
            const isActive = location === path;

            return (
              <Link key={path} href={path}>
                <Button
                  variant="ghost"
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 h-auto transition-colors relative",
                    isActive
                      ? "text-primary bg-primary/10"
                      : "text-gray-600 hover:text-primary hover:bg-primary/5"
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
