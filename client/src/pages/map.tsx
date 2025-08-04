import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BottomNavigation } from "@/components/bottom-navigation";

export default function MapPage() {
  return (
    <div className="min-h-screen max-w-md mx-auto bg-white shadow-lg relative">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MapPin className="text-primary h-6 w-6" />
            <h1 className="text-xl font-bold text-gray-900">Event Map</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            data-testid="button-current-location"
          >
            <Navigation className="h-4 w-4 mr-2" />
            My Location
          </Button>
        </div>
      </header>

      {/* Map Placeholder */}
      <main className="flex-1 overflow-hidden pb-16">
        <div className="h-full bg-gray-100 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Map View</h3>
            <p className="text-sm text-gray-500 mb-4">
              Interactive map showing event locations would be displayed here.
            </p>
            <p className="text-xs text-gray-400">
              Map integration requires additional API setup
            </p>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
