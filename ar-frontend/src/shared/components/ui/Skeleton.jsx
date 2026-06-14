import { cn } from "../../lib/utils";

/**
 * Enhanced Skeleton component with shimmer animation.
 * Uses custom CSS keyframe for smooth shimmer effect.
 * Follows motion design best practices: subtle, purposeful, performant.
 */
export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        "rounded-md bg-muted shimmer relative overflow-hidden",
        className
      )}
      {...props}
    >
      {/* Subtle shine overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />
    </div>
  );
}

/**
 * Skeleton text - mimics a line of text with variable width
 */
export function SkeletonText({ lines = 1, className, ...props }) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-4", i === lines - 1 && lines > 1 ? "w-3/4" : "w-full")}
        />
      ))}
    </div>
  );
}
