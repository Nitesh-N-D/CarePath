interface LoadingSkeletonProps {
  className?: string;
}

function LoadingSkeleton({ className = "" }: LoadingSkeletonProps) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200/80 ${className}`} />;
}

export default LoadingSkeleton;
