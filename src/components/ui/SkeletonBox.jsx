export default function SkeletonBox({ className = "" }) {
  return (
    <div
      className={`skeleton-shimmer rounded-xl ${className}`}
      aria-hidden="true"
    />
  );
}
