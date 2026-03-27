import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link, type LinkProps } from "react-router-dom";

type Variant = "default" | "secondary" | "outline" | "ghost";

type SharedProps = {
  children: ReactNode;
  className?: string;
  variant?: Variant;
};

type ButtonAsButton = SharedProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    to?: undefined;
  };

type ButtonAsLink = SharedProps &
  Omit<LinkProps, "className"> & {
    to: string;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink;

function getVariantClassName(variant: Variant) {
  switch (variant) {
    case "secondary":
      return "border border-[var(--color-border)] bg-[rgba(255,248,240,0.7)] text-[var(--color-text)] hover:bg-[rgba(49,88,79,0.08)]";
    case "outline":
      return "border border-[var(--color-border)] bg-[rgba(255,255,255,0.64)] text-[var(--color-text)] hover:bg-[rgba(49,88,79,0.08)]";
    case "ghost":
      return "bg-transparent text-[var(--color-text-soft)] hover:bg-[rgba(49,88,79,0.08)] hover:text-[var(--color-text)]";
    default:
      return "border border-[rgba(166,124,82,0.24)] bg-[linear-gradient(135deg,#183c38_0%,#2d5249_55%,#8b6a46_100%)] text-white hover:brightness-105";
  }
}

function baseClassName(variant: Variant, className = "") {
  return `inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium shadow-sm transition duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${getVariantClassName(variant)} ${className}`;
}

function Button(props: ButtonProps) {
  const variant = props.variant || "default";

  if ("to" in props && typeof props.to === "string") {
    const { children, className, to, ...rest } = props;
    return (
      <Link to={to} className={baseClassName(variant, className)} {...rest}>
        {children}
      </Link>
    );
  }

  const { children, className, ...rest } = props;
  return (
    <button className={baseClassName(variant, className)} {...rest}>
      {children}
    </button>
  );
}

export default Button;
