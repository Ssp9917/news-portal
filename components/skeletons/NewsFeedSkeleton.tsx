interface NewsFeedSkeletonProps {
  count?: number;
}

export default function NewsFeedSkeleton({ count = 8 }: NewsFeedSkeletonProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950"
        >
          <div className="skeleton h-48 w-full rounded-none" />
          <div className="flex flex-grow flex-col p-5">
            <div className="skeleton skeleton-round mb-3 h-5 w-20" />
            <div className="mb-2 space-y-2">
              <div className="skeleton skeleton-text w-full" />
              <div className="skeleton skeleton-text w-5/6" />
              <div className="skeleton skeleton-text w-3/4" />
            </div>
            <div className="mt-2 flex-grow space-y-2">
              <div className="skeleton skeleton-text w-full" />
              <div className="skeleton skeleton-text w-2/3" />
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-4 dark:border-neutral-800">
              <div className="skeleton skeleton-text w-24" />
              <div className="skeleton skeleton-text w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
