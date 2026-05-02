export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white transition-colors dark:bg-neutral-950">
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#f3f3f3] border-t-[#D32F2F] dark:border-neutral-700 dark:border-t-red-500" />
          <div className="absolute h-3 w-3 animate-ping rounded-full bg-[#D32F2F]" />
        </div>
        <p className="animate-pulse text-sm text-gray-500 dark:text-neutral-400">Loading…</p>
      </div>
    </div>
  );
}
