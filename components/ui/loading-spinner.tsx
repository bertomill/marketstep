export function LoadingSpinner({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-spin rounded-full border-4 border-t-4 border-gray-200 border-t-blue-500 ${className}`} />
  );
} 