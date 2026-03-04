import Navbar from "@/components/shared/Navbar";

export default function Loading() {
  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Title skeleton */}
        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />

        {/* AddHoldingForm card skeleton */}
        <div className="rounded-lg border border-gray-700 bg-gray-800 p-6 space-y-4">
          <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
          <div className="h-10 w-28 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* HoldingsTable card skeleton */}
        <div className="rounded-lg border border-gray-700 bg-gray-800 p-6 space-y-3">
          <div className="h-5 w-28 bg-gray-200 rounded animate-pulse mb-4" />

          {/* Header row */}
          <div className="grid grid-cols-8 gap-4 pb-2 border-b border-gray-700">
            {[16, 12, 14, 14, 16, 14, 12, 10].map((w, i) => (
              <div key={i} className={`h-4 w-${w} bg-gray-200 rounded animate-pulse`} />
            ))}
          </div>

          {/* Data rows */}
          {Array.from({ length: 5 }).map((_, row) => (
            <div key={row} className="grid grid-cols-8 gap-4 py-3 border-b border-gray-700/50">
              {[14, 10, 12, 12, 14, 12, 14, 8].map((w, col) => (
                <div key={col} className={`h-4 w-${w} bg-gray-200 rounded animate-pulse`} />
              ))}
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
