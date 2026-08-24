export default function ApiErrorBanner({
  message,
  className = "",
}: {
  message?: string | null;
  className?: string;
}) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className={`rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200 ${className}`}
    >
      <p className="font-medium">Something went wrong loading this content.</p>
      <p className="mt-1 text-red-200/80">{message}</p>
      <p className="mt-2 text-xs text-red-200/60">
        Check your connection or try refreshing the page.
      </p>
    </div>
  );
}
