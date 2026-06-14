export default function BreakingNewsSkeleton() {
  return (
    <div className="flex items-center gap-3 overflow-hidden bg-gray-100 px-4 py-2 dark:bg-neutral-900">
      <div className="skeleton skeleton-round h-5 w-20 flex-shrink-0" />
      <div className="flex flex-1 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton skeleton-text w-48 flex-shrink-0" />
        ))}
      </div>
    </div>
  );
}
