// client/src/components/event-card.jsx
import { Calendar, MapPin, Users, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Default image (uploaded file path — will be transformed to a URL by your tooling)
const DEFAULT_IMAGE = "/mnt/data/bf3d1bf1-ed54-4293-b33c-f2a53716f562.png";

/*
  Expected event shape (based on your event-details page):
  {
    id,
    title,
    imageUrl,
    category,
    startDate,
    endDate,
    location,
    address,
    price,
    maxAttendees,
    organizerName,
    organizerEmail,
    description
  }
*/

export function EventCard({ event, onViewDetails }) {
  const queryClient = useQueryClient();

  if (!event) return null;

  const imageSrc = event.imageUrl || DEFAULT_IMAGE;

  const { data: favoriteData } = useQuery({
    queryKey: [event?.id ? `/api/favorites/${event.id}/check` : "/api/favorites"],
    enabled: !!event?.id,
  });

  const isFavorite = favoriteData?.isFavorite || false;

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorite) {
        return apiRequest("DELETE", `/api/favorites/${event.id}`);
      } else {
        return apiRequest("POST", "/api/favorites", { productId: event.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      queryClient.invalidateQueries({
        queryKey: [event?.id ? `/api/favorites/${event.id}/check` : ""],
      });
    },
  });

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    toggleFavoriteMutation.mutate();
  };

  const formatDateShort = (iso) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const formatTimeShort = (iso) =>
    new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  const priceLabel = (() => {
    const price = parseFloat(String(event.price || "0"));
    return price === 0 ? "Free" : `$${price.toFixed(2)}`;
  })();

  const categoryColor = (() => {
    switch ((event.category || "").toLowerCase()) {
      case "networking":
        return "bg-secondary/10 text-secondary";
      case "workshop":
        return "bg-accent/10 text-accent";
      case "seminar":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  })();

  return (
    <Card
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onViewDetails && onViewDetails(event.id)}
      role="button"
      aria-label={`View details for ${event.title}`}
    >
      <div className="relative">
        <img src={imageSrc} alt={event.title} className="w-full h-44 object-cover" loading="lazy" />
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className={cn("text-xs font-medium", categoryColor)}>
            {event.category}
          </Badge>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-1 h-auto hover:bg-white"
          onClick={handleToggleFavorite}
          disabled={toggleFavoriteMutation.isLoading}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? "Remove favorite" : "Add favorite"}
        >
          <Heart className={cn("h-4 w-4 transition-colors", isFavorite ? "fill-red-500 text-red-500" : "text-neutral-500")} />
        </Button>
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 leading-tight line-clamp-2" data-testid={`text-event-title-${event.id}`}>
            {event.title}
          </h3>
          <div className="text-sm text-neutral-500 font-medium">{priceLabel}</div>
        </div>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2" data-testid={`text-event-description-${event.id}`}>
          {event.description}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              <div>
                <div className="font-medium text-gray-900">{formatDateShort(event.startDate)}</div>
                <div className="text-xs">{formatTimeShort(event.startDate)}</div>
              </div>
            </div>

            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-gray-500" />
              <div className="text-xs">
                <div className="font-medium text-gray-900">{event.location}</div>
                <div className="text-neutral-500 truncate max-w-xs">{event.address}</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end">
            {event.maxAttendees ? (
              <div className="flex items-center text-xs text-neutral-600">
                <Users className="h-4 w-4 mr-2 text-gray-500" />
                <span>Max {event.maxAttendees}</span>
              </div>
            ) : null}

            <Button
              size="sm"
              variant="outline"
              className="mt-3"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails && onViewDetails(event.id);
              }}
              data-testid={`button-view-event-${event.id}`}
            >
              View
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
