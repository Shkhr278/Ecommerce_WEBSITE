import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Heart, Calendar, MapPin, Tag, User, Mail, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

export default function EventDetailsPage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const { data: event, isLoading, error } = useQuery({
    queryKey: [id ? `/api/events/${id}` : "/api/events"],
    enabled: !!id,
  });

  const { data: favoriteData } = useQuery({
    queryKey: [id ? `/api/favorites/${id}/check` : "/api/favorites"],
    enabled: !!id,
  });

  const isFavorite = favoriteData?.isFavorite || false;

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorite) {
        return apiRequest("DELETE", `/api/favorites/${id}`);
      } else {
        return apiRequest("POST", "/api/favorites", { eventId: id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      queryClient.invalidateQueries({ queryKey: [id ? `/api/favorites/${id}/check` : ""] });
    },
  });

  const handleBack = () => {
    navigate("/");
  };

  const handleToggleFavorite = () => {
    toggleFavoriteMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen max-w-md mx-auto bg-white shadow-lg">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200" />
          <div className="p-4 space-y-4">
            <div className="h-6 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen max-w-md mx-auto bg-white shadow-lg flex items-center justify-center">
        <div className="text-center p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Event not found</h2>
          <p className="text-gray-600 mb-4">The event you're looking for doesn't exist.</p>
          <Button onClick={handleBack} data-testid="button-back-to-events">
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  const eventData = event;

  const formatPrice = (price) => {
    const priceNum = parseFloat(price);
    return priceNum === 0 ? "Free" : `$${priceNum}`;
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  const getCategoryColor = (category) => {
    switch ((category || "").toLowerCase()) {
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
    <div className="min-h-screen max-w-md mx-auto bg-white shadow-lg">
      {/* Header */}
      <header className="relative">
        <img src={eventData.imageUrl} alt={eventData.title} className="w-full h-64 object-cover" />
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <Button
            variant="secondary"
            size="sm"
            className="bg-white/90 backdrop-blur-sm"
            onClick={handleBack}
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="bg-white/90 backdrop-blur-sm p-2"
            onClick={handleToggleFavorite}
            disabled={toggleFavoriteMutation.isLoading}
            data-testid="button-favorite"
          >
            <Heart
              className={cn("h-4 w-4", isFavorite ? "fill-red-500 text-red-500" : "text-gray-600")}
            />
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="p-4 pb-8">
        <div className="mb-4">
          <Badge variant="secondary" className={cn("mb-3", getCategoryColor(eventData.category))}>
            {eventData.category}
          </Badge>
          <h1 className="text-2xl font-bold text-gray-900 mb-2" data-testid="text-event-title">
            {eventData.title}
          </h1>
        </div>

        {/* Event Info */}
        <Card className="mb-4">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center">
              <Calendar className="mr-3 h-5 w-5 text-gray-500 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900" data-testid="text-event-date">
                  {formatDate(eventData.startDate)}
                </p>
                <p className="text-sm text-gray-600" data-testid="text-event-time">
                  {formatTime(eventData.startDate)} - {formatTime(eventData.endDate)}
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <MapPin className="mr-3 h-5 w-5 text-gray-500 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900" data-testid="text-event-location">
                  {eventData.location}
                </p>
                <p className="text-sm text-gray-600" data-testid="text-event-address">
                  {eventData.address}
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <Tag className="mr-3 h-5 w-5 text-gray-500 flex-shrink-0" />
              <span
                className={cn(
                  "font-medium text-lg",
                  parseFloat(eventData.price) === 0 ? "text-secondary" : "text-gray-900"
                )}
                data-testid="text-event-price"
              >
                {formatPrice(eventData.price)}
              </span>
            </div>

            {eventData.maxAttendees && (
              <div className="flex items-center">
                <Users className="mr-3 h-5 w-5 text-gray-500 flex-shrink-0" />
                <span className="text-gray-900" data-testid="text-event-capacity">
                  Max {eventData.maxAttendees} attendees
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Description */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-900 mb-2">About This Event</h3>
            <p className="text-gray-700 leading-relaxed" data-testid="text-event-description">
              {eventData.description}
            </p>
          </CardContent>
        </Card>

        {/* Organizer */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Organizer</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <User className="mr-3 h-4 w-4 text-gray-500" />
                <span className="text-gray-900" data-testid="text-organizer-name">
                  {eventData.organizerName}
                </span>
              </div>
              {eventData.organizerEmail && (
                <div className="flex items-center">
                  <Mail className="mr-3 h-4 w-4 text-gray-500" />
                  <a href={`mailto:${eventData.organizerEmail}`} className="text-primary hover:underline">
                    {eventData.organizerEmail}
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        <Button className="w-full bg-primary text-white hover:bg-primary/90 py-3 text-lg" data-testid="button-register">
          Register for Event
        </Button>
      </main>
    </div>
  );
}
