import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, Settings, Search, Filter, Plus, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EventCard } from "@/components/event-card";
import { LoadingOverlay } from "@/components/loading-overlay";
import { LocationError } from "@/components/location-error";
import { BottomNavigation } from "@/components/bottom-navigation";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import type { Event } from "@shared/schema";

export default function EventsPage() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { latitude, longitude, error, loading, requestLocation, clearError } = useGeolocation();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [location, setLocation] = useState("San Francisco, CA");

  const filters = [
    { id: "all", label: "All", type: "category" },
    { id: "free", label: "Free", type: "price", maxPrice: 0 },
    { id: "under25", label: "Under $25", type: "price", maxPrice: 25 },
    { id: "under50", label: "Under $50", type: "price", maxPrice: 50 },
  ];

  // Build query parameters
  const queryParams = new URLSearchParams();
  if (searchQuery) queryParams.append("search", searchQuery);
  if (latitude && longitude) {
    queryParams.append("lat", latitude.toString());
    queryParams.append("lng", longitude.toString());
    queryParams.append("radius", "10"); // 10 miles
  }

  const activeFilterData = filters.find(f => f.id === activeFilter);
  if (activeFilterData?.type === "price") {
    queryParams.append("maxPrice", activeFilterData.maxPrice?.toString() || "");
  }

  const { 
    data: events = [], 
    isLoading: eventsLoading, 
    error: eventsError 
  } = useQuery<Event[]>({
    queryKey: ["/api/events?" + queryParams.toString()],
    enabled: true,
  });

  // Request location on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      requestLocation();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Update location name when coordinates change
  useEffect(() => {
    if (latitude && longitude) {
      // In a real app, you'd reverse geocode the coordinates
      setLocation("San Francisco, CA");
    }
  }, [latitude, longitude]);

  const handleFilterClick = (filterId: string) => {
    setActiveFilter(filterId);
  };

  const handleViewDetails = (eventId: string) => {
    navigate(`/event/${eventId}`);
  };

  const handleLoadMore = () => {
    // In a real app, you'd implement pagination
    console.log("Load more events");
  };

  return (
    <div className="min-h-screen max-w-md mx-auto bg-white shadow-lg relative">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <MapPin className="text-primary h-5 w-5" />
            <div>
              <p className="text-sm font-medium text-gray-900" data-testid="text-user-location">
                {location}
              </p>
              <p className="text-xs text-neutral-500">Within 10 miles</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
            data-testid="button-location-settings"
          >
            <Settings className="h-4 w-4 text-neutral-500" />
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search events, keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white border-0"
            data-testid="input-search-events"
          />
        </div>
      </header>

      {/* Filter Section */}
      <section className="px-4 py-3 bg-white border-b border-gray-100">
        <div className="flex items-center space-x-3 overflow-x-auto pb-1">
          {filters.map((filter) => (
            <Button
              key={filter.id}
              variant={activeFilter === filter.id ? "default" : "secondary"}
              size="sm"
              className={cn(
                "flex-shrink-0 rounded-full text-sm font-medium transition-colors",
                activeFilter === filter.id
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
              onClick={() => handleFilterClick(filter.id)}
              data-testid={`button-filter-${filter.id}`}
            >
              {filter.id === "all" && <Filter className="mr-1 h-3 w-3" />}
              {filter.label}
            </Button>
          ))}
        </div>
      </section>

      {/* Events Feed */}
      <main className="flex-1 overflow-y-auto pb-20 custom-scrollbar">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Events Near You</h2>
            <span className="text-sm text-neutral-500" data-testid="text-events-count">
              {events.length} events
            </span>
          </div>

          {eventsError && (
            <div className="text-center py-8">
              <p className="text-red-600 mb-2">Failed to load events</p>
              <Button 
                variant="outline" 
                onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/events"] })}
                data-testid="button-retry-events"
              >
                Try Again
              </Button>
            </div>
          )}

          {eventsLoading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-200 rounded-xl h-80 animate-pulse" />
              ))}
            </div>
          )}

          {!eventsLoading && !eventsError && events.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
              <p className="text-sm text-gray-500 mb-4">
                Try adjusting your search or filters to find more events.
              </p>
            </div>
          )}

          {!eventsLoading && !eventsError && events.length > 0 && (
            <>
              <div className="space-y-4">
                {events.map((event: Event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>

              {/* Load More */}
              <div className="mt-6 text-center">
                <Button
                  variant="outline"
                  className="px-6 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200"
                  onClick={handleLoadMore}
                  data-testid="button-load-more"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Load More Events
                </Button>
              </div>
            </>
          )}
        </div>
      </main>

      <BottomNavigation />
      <LoadingOverlay isVisible={loading} />
      <LocationError
        isVisible={!!error}
        error={error || ""}
        onRetry={requestLocation}
        onDismiss={clearError}
      />
    </div>
  );
}
