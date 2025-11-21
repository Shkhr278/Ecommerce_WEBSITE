import { cn } from "@/lib/utils";

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

export function LoadingOverlay({ isVisible, message = "Finding events nearby..." }: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50 fade-in">
      <div className="bg-white rounded-lg p-6 flex flex-col items-center mx-4 max-w-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
        <p className="text-sm text-gray-600 text-center">{message}</p>
      </div>
    </div>
  );
}
