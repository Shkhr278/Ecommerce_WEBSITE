import { Heart, Calendar, MapPin, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Event } from "@shared/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface EventCardProps {
  event: Event;
  onViewDetails: (eventId: string) => void;
}

export function EventCard({ event, onViewDetails }: EventCardProps) {
  const queryClient = useQueryClient();

  const { data: favoriteData } = useQuery<{ isFavorite: boolean }>({
    queryKey: ["/api/favorites", event.id, "check"],
    enabled: !!event.id,
  });

  const isFavorite = favoriteData?.isFavorite || false;

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorite) {
        return apiRequest("DELETE", `/api/favorites/${event.id}`);
      } else {
        return apiRequest("POST", "/api/favorites", { eventId: event.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites", event.id, "check"] });
    },
  });

  const handleToggleFavorite = () => {
    toggleFavoriteMutation.mutate();
  };

  const formatPrice = (price: string) => {
    const priceNum = parseFloat(price);
    return priceNum === 0 ? "Free" : `$${priceNum}`;
  };

  const formatDateTime = (date: Date) => {
    const now = new Date();
    const eventDate = new Date(date);
    const isToday = eventDate.toDateString() === now.toDateString();
    const isTomorrow = eventDate.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();

    let dateString = "";
    if (isToday) {
      dateString = "Today";
    } else if (isTomorrow) {
      dateString = "Tomorrow";
    } else {
      dateString = eventDate.toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric" 
      });
    }

    const timeString = eventDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    return `${dateString}, ${timeString}`;
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "networking":
        return "bg-secondary/10 text-secondary";
      case "workshop":
        return "bg-accent/10 text-accent";
      case "trade show":
        return "bg-purple-100 text-purple-700";
      case "seminar":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden fade-in">
      <img
        src={event.imageUrl}
        alt={event.title}
        className="w-full h-40 object-cover"
        loading="lazy"
      />
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <Badge 
            variant="secondary" 
            className={cn("text-xs font-medium", getCategoryColor(event.category))}
          >
            {event.category}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className="p-1 h-auto"
            onClick={handleToggleFavorite}
            disabled={toggleFavoriteMutation.isPending}
            data-testid={`button-favorite-${event.id}`}
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
        
        <h3 className="font-semibold text-gray-900 mb-2" data-testid={`text-event-title-${event.id}`}>
          {event.title}
        </h3>
        
        <div className="space-y-1 text-sm text-neutral-600 mb-3">
          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
            <span data-testid={`text-event-date-${event.id}`}>
              {formatDateTime(event.startDate)}
            </span>
          </div>
          <div className="flex items-center">
            <MapPin className="mr-2 h-4 w-4 flex-shrink-0" />
            <span data-testid={`text-event-location-${event.id}`} className="truncate">
              {event.location}
            </span>
          </div>
          <div className="flex items-center">
            <Tag className="mr-2 h-4 w-4 flex-shrink-0" />
            <span 
              className={cn(
                "font-medium",
                parseFloat(event.price) === 0 ? "text-secondary" : "text-gray-900"
              )}
              data-testid={`text-event-price-${event.id}`}
            >
              {formatPrice(event.price)}
            </span>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-3" data-testid={`text-event-description-${event.id}`}>
          {event.description}
        </p>
        
        <Button
          className="w-full bg-primary text-white hover:bg-primary/90 transition-colors"
          onClick={() => onViewDetails(event.id)}
          data-testid={`button-view-details-${event.id}`}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}
