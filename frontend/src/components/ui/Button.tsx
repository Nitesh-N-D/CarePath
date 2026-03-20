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
      return "border border-stone-200 bg-stone-50 text-slate-800 hover:bg-stone-100";
    case "outline":
      return "border border-stone-200 bg-white text-slate-700 hover:bg-stone-50";
    case "ghost":
      return "bg-transparent text-slate-700 hover:bg-stone-100";
    default:
      return "border border-slate-200 bg-slate-900 text-white hover:bg-slate-800";
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
