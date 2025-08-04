import { Calendar, Map, Heart, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function BottomNavigation() {
  const [location] = useLocation();

  const navItems = [
    { 
      icon: Calendar, 
      label: "Events", 
      path: "/", 
      testId: "nav-events"
    },
    { 
      icon: Map, 
      label: "Map", 
      path: "/map", 
      testId: "nav-map"
    },
    { 
      icon: Heart, 
      label: "Favorites", 
      path: "/favorites", 
      testId: "nav-favorites"
    },
    { 
      icon: User, 
      label: "Profile", 
      path: "/profile", 
      testId: "nav-profile"
    },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 px-4 py-2 z-10">
      <div className="flex items-center justify-around">
        {navItems.map(({ icon: Icon, label, path, testId }) => {
          const isActive = location === path;
          
          return (
            <Link key={path} href={path}>
              <Button
                variant="ghost"
                className={cn(
                  "flex flex-col items-center py-2 px-3 h-auto min-w-0 transition-colors",
                  isActive 
                    ? "text-primary" 
                    : "text-neutral-500 hover:text-primary"
                )}
                data-testid={testId}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">{label}</span>
              </Button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
