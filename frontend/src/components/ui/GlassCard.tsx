import type { HTMLAttributes, ReactNode } from "react";

type GlassCardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

function GlassCard({ children, className = "", ...props }: GlassCardProps) {
  return (
    <div
      className={`glass-panel rounded-xl ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default GlassCard;
