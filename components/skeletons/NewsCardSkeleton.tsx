export default function NewsCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
      {/* Image */}
      <div className="skeleton h-48 w-full rounded-none" />

      {/* Body */}
      <div className="flex flex-grow flex-col p-5">
        {/* Category badge */}
        <div className="skeleton skeleton-round mb-3 h-5 w-20" />

        {/* Title lines */}
        <div className="mb-2 space-y-2">
          <div className="skeleton skeleton-text w-full" />
          <div className="skeleton skeleton-text w-5/6" />
          <div className="skeleton skeleton-text w-3/4" />
        </div>

        {/* Excerpt lines */}
        <div className="mt-2 flex-grow space-y-2">
          <div className="skeleton skeleton-text w-full" />
          <div className="skeleton skeleton-text w-full" />
          <div className="skeleton skeleton-text w-2/3" />
        </div>

        {/* Meta */}
        <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-4 dark:border-neutral-800">
          <div className="skeleton skeleton-text w-24" />
          <div className="skeleton skeleton-text w-16" />
        </div>
      </div>
    </div>
  );
}
