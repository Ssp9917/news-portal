export default function HeroSkeleton() {
  return (
    <section className="mb-8 grid grid-cols-1 gap-6 md:mb-12 md:gap-8 lg:grid-cols-3">
      {/* Main large card */}
      <div className="skeleton h-[300px] rounded-xl sm:h-[400px] md:h-[500px] lg:col-span-2" />

      {/* Side list */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex flex-col gap-4 sm:gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3 border-b border-gray-50 pb-3 last:border-0 last:pb-0 dark:border-neutral-800 sm:gap-4 sm:pb-4">
              <div className="skeleton skeleton-round h-8 w-8 flex-shrink-0" />
              <div className="min-w-0 flex-1 space-y-2 pt-1">
                <div className="skeleton skeleton-text w-full" />
                <div className="skeleton skeleton-text w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
