import type { HTMLAttributes, ReactNode } from "react";

type GlassCardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

function GlassCard({ children, className = "", ...props }: GlassCardProps) {
  return (
    <div
      className={`rounded-[28px] border border-white/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,250,252,0.88))] shadow-[0_18px_50px_rgba(15,23,42,0.07)] backdrop-blur-xl ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default GlassCard;
