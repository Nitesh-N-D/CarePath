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
      return "border border-borderLight bg-card text-textPrimary shadow-md hover:scale-[1.02] hover:shadow-xl dark:border-borderDark dark:bg-cardDark dark:text-textDark dark:hover:bg-white/5";
    case "outline":
      return "border border-borderLight bg-transparent text-textPrimary hover:scale-[1.02] hover:bg-primary/5 hover:shadow-md dark:border-borderDark dark:text-textDark dark:hover:bg-white/5";
    case "ghost":
      return "bg-transparent text-slate-600 hover:scale-[1.02] hover:bg-primary/5 hover:text-textPrimary dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-textDark";
    default:
      return "border border-primary/20 bg-gradient-to-r from-primary to-accent text-white shadow-md hover:scale-[1.02] hover:shadow-xl";
  }
}

function baseClassName(variant: Variant, className = "") {
  return `inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60 ${getVariantClassName(variant)} ${className}`;
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
