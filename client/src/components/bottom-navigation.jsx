import { Home, Bell, User, Menu } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

export function BottomNavigation() {
  const [location] = useLocation();

  const { data: notifications = [] } = useQuery({
    queryKey: ["/api/notifications"],
  });

  const notificationsCount = Array.isArray(notifications)
    ? notifications.length
    : 0;

  const navItems = [
    { icon: Home, label: "Home", path: "/", testId: "nav-home" },
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
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-2 z-20 lg:hidden shadow-inner">
      <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
        <Button variant="ghost" className="p-2">
          <Menu className="h-6 w-6 text-gray-700" />
        </Button>
        <div className="flex space-x-12">
          {navItems.map(({ icon: Icon, label, path, testId, badge }) => {
            const isActive = location === path;

            return (
              <Link key={path} href={path}>
                <Button
                  variant="ghost"
                  className={cn(
                    "flex flex-col items-center py-1 px-2 h-auto min-w-0 transition-colors relative",
                    isActive
                      ? "text-primary"
                      : "text-neutral-500 hover:text-primary"
                  )}
                  data-testid={testId}
                >
                  <div className="relative">
                    <Icon className="h-5 w-5 mb-1" />
                    {badge && (
                      <div className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
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
        <div />
      </div>
    </nav>
  );
}
