import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LocationError({ isVisible, error, onRetry, onDismiss }) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-x-4 top-20 bg-red-50 border border-red-200 rounded-lg p-4 z-40 fade-in">
      <div className="flex items-start">
        <AlertTriangle className="text-red-500 mr-3 mt-0.5 h-5 w-5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="text-sm font-medium text-red-800">Location Access Required</h4>
          <p className="text-sm text-red-700 mt-1">{error}</p>
          <Button
            variant="link"
            size="sm"
            className="mt-2 p-0 h-auto text-sm text-red-800 font-medium underline"
            onClick={onRetry}
            data-testid="button-retry-location"
          >
            Try Again
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-500 hover:text-red-700 p-1 h-auto"
          onClick={onDismiss}
          data-testid="button-dismiss-error"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
