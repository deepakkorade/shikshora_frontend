/**
 * Skeleton — reusable shimmer loading placeholder
 * Usage:
 *   <Skeleton className="h-8 w-48" />
 *   <Skeleton.Card rows={4} />
 *   <Skeleton.Table rows={5} cols={4} />
 *   <Skeleton.StatCards />
 */

function Shimmer({ className = '' }) {
  return (
    <div
      className={`rounded-xl bg-card-border/40 overflow-hidden relative ${className}`}
    >
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)',
          animation: 'shimmer 1.6s infinite',
          backgroundSize: '200% 100%',
        }}
      />
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
      `}</style>
    </div>
  );
}

// Single line skeleton
export default function Skeleton({ className = 'h-4 w-full' }) {
  return <Shimmer className={className} />;
}

// Card with N rows
Skeleton.Card = function SkeletonCard({ rows = 3, className = '' }) {
  return (
    <div className={`p-5 rounded-2xl bg-card border border-border/40 space-y-3 ${className}`}>
      <Shimmer className="h-4 w-1/3" />
      {Array.from({ length: rows }).map((_, i) => (
        <Shimmer key={i} className={`h-3 ${i === rows - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  );
};

// Table with N rows × cols
Skeleton.Table = function SkeletonTable({ rows = 5, cols = 4, className = '' }) {
  return (
    <div className={`rounded-2xl border border-border/40 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex gap-4 px-4 py-3 bg-card-border/20 border-b border-border/40">
        {Array.from({ length: cols }).map((_, i) => (
          <Shimmer key={i} className="h-3 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 px-4 py-3.5 border-b border-border/30 last:border-0">
          {Array.from({ length: cols }).map((_, c) => (
            <Shimmer key={c} className={`h-3 flex-1 ${c === 0 ? 'w-1/4 flex-none' : ''}`} />
          ))}
        </div>
      ))}
    </div>
  );
};

// 4 stat cards grid (for dashboards)
Skeleton.StatCards = function SkeletonStatCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-5 rounded-2xl bg-card border border-border/40 space-y-3">
          <div className="flex justify-between items-center">
            <Shimmer className="h-3 w-28" />
            <Shimmer className="w-9 h-9 rounded-xl" />
          </div>
          <Shimmer className="h-8 w-20" />
          <Shimmer className="h-2.5 w-24" />
        </div>
      ))}
    </div>
  );
};

// Page-level skeleton (full page loading)
Skeleton.Page = function SkeletonPage() {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="space-y-2">
        <Shimmer className="h-7 w-56" />
        <Shimmer className="h-3.5 w-80" />
      </div>
      <Skeleton.StatCards />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Skeleton.Card rows={6} className="lg:col-span-2" />
        <Skeleton.Card rows={5} />
      </div>
      <Skeleton.Table rows={4} cols={5} />
    </div>
  );
};
