// client/src/pages/notifications.jsx
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCircle2, Info, AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BottomNavigation } from "@/components/bottom-navigation";
import { TopNavigation } from "@/components/top-navigation";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const {
    data: notifications = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/notifications"],
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
  };

  const handleGoBack = () => {
    navigate("/");
  };

  const getTypeStyles = (type) => {
    const key = (type || "").toLowerCase();

    switch (key) {
      case "success":
      case "order":
        return {
          icon: CheckCircle2,
          badgeClass: "bg-green-100 text-green-700",
        };
      case "warning":
        return {
          icon: AlertTriangle,
          badgeClass: "bg-yellow-100 text-yellow-700",
        };
      case "info":
      default:
        return {
          icon: Info,
          badgeClass: "bg-blue-100 text-blue-700",
        };
    }
  };

  const formatDate = (value) => {
    if (!value) return "";
    const date = typeof value === "string" ? new Date(value) : value;
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const sortedNotifications = [...notifications].sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTime - aTime;
  });

  return (
    <div className="min-h-screen max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 bg-white lg:shadow-lg relative pb-20 lg:pb-4 lg:pt-16">
      <TopNavigation />

      {/* Header below fixed top nav on large screens */}
      <header className="sticky top-0 lg:top-16 z-10 bg-white border-b border-gray-200 py-4 px-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Bell className="text-primary h-6 w-6" />
          <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            data-testid="button-refresh-notifications"
          >
            Refresh
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGoBack}
            className="p-2"
            data-testid="button-back-home"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-20 custom-scrollbar">
        <div className="px-4 py-4">
          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 bg-gray-100 rounded-lg animate-pulse"
                />
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-10">
              <p className="text-red-600 mb-2">
                Failed to load notifications.
              </p>
              <Button
                variant="outline"
                onClick={handleRefresh}
                data-testid="button-retry-notifications"
              >
                Try Again
              </Button>
            </div>
          )}

          {!isLoading && !error && sortedNotifications.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                You’re all caught up
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                We’ll show important updates and announcements from our team
                here.
              </p>
              <Button onClick={handleGoBack} data-testid="button-back-to-home">
                Go to Home
              </Button>
            </div>
          )}

          {!isLoading && !error && sortedNotifications.length > 0 && (
            <div className="space-y-3">
              {sortedNotifications.map((notification) => {
                const { icon: Icon, badgeClass } = getTypeStyles(
                  notification.type
                );
                const isUnread =
                  notification.isRead === false ||
                  notification.read === false;

                return (
                  <Card
                    key={notification.id || notification._id}
                    className={cn(
                      "border border-gray-200",
                      isUnread ? "bg-blue-50/40" : "bg-white"
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <p
                                className="text-sm font-semibold text-gray-900 line-clamp-1"
                                data-testid="text-notification-title"
                              >
                                {notification.title || "Update from LocalSpark"}
                              </p>
                              {notification.type && (
                                <Badge
                                  variant="secondary"
                                  className={cn(
                                    "text-[10px] font-medium",
                                    badgeClass
                                  )}
                                >
                                  {notification.type}
                                </Badge>
                              )}
                              {isUnread && (
                                <span className="h-2 w-2 rounded-full bg-primary" />
                              )}
                            </div>
                            {notification.createdAt && (
                              <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                                {formatDate(notification.createdAt)}
                              </span>
                            )}
                          </div>
                          <p
                            className="text-sm text-gray-700 leading-snug"
                            data-testid="text-notification-message"
                          >
                            {notification.message ||
                              notification.body ||
                              "You have a new update from our team."}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
