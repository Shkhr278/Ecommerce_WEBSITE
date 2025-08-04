import { User, Settings, Bell, HelpCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BottomNavigation } from "@/components/bottom-navigation";

export default function ProfilePage() {
  const menuItems = [
    { icon: Settings, label: "Account Settings", testId: "button-account-settings" },
    { icon: Bell, label: "Notifications", testId: "button-notifications" },
    { icon: HelpCircle, label: "Help & Support", testId: "button-help" },
    { icon: LogOut, label: "Sign Out", testId: "button-sign-out", variant: "destructive" },
  ];

  return (
    <div className="min-h-screen max-w-md mx-auto bg-white shadow-lg relative">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="flex items-center space-x-3">
          <User className="text-primary h-6 w-6" />
          <h1 className="text-xl font-bold text-gray-900">Profile</h1>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-20 custom-scrollbar">
        <div className="px-4 py-4">
          {/* User Info */}
          <Card className="mb-6">
            <CardContent className="p-6 text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1" data-testid="text-user-name">
                Business Owner
              </h2>
              <p className="text-sm text-gray-500" data-testid="text-user-email">
                owner@business.com
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3"
                data-testid="button-edit-profile"
              >
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          {/* Menu Items */}
          <div className="space-y-2">
            {menuItems.map(({ icon: Icon, label, testId, variant }) => (
              <Card key={testId}>
                <CardContent className="p-0">
                  <Button
                    variant="ghost"
                    className={`w-full justify-start p-4 h-auto ${
                      variant === "destructive" ? "text-red-600 hover:text-red-700 hover:bg-red-50" : ""
                    }`}
                    data-testid={testId}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {label}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* App Info */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400 mb-1">BizEvents App</p>
            <p className="text-xs text-gray-400">Version 1.0.0</p>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
