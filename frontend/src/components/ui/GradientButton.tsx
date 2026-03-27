import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link, type LinkProps } from "react-router-dom";

type SharedProps = {
  children: ReactNode;
  className?: string;
};

type GradientButtonAsButton = SharedProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    to?: undefined;
  };

type GradientButtonAsLink = SharedProps &
  Omit<LinkProps, "className"> & {
    to: string;
  };

type GradientButtonProps = GradientButtonAsButton | GradientButtonAsLink;

function baseClassName(className = "") {
  return `inline-flex items-center justify-center rounded-xl border px-5 py-3 font-semibold text-white shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 ${className}`;
}

function GradientButton(props: GradientButtonProps) {
  if ("to" in props && typeof props.to === "string") {
    const { children, className, to, ...rest } = props;
    return (
      <Link
        to={to}
        className={`border-primary/20 bg-gradient-to-r from-primary to-accent ${baseClassName(
          className
        )}`}
        {...rest}
      >
        {children}
      </Link>
    );
  }

  const { children, className, ...rest } = props;
  return (
    <button
      className={`border-primary/20 bg-gradient-to-r from-primary to-accent ${baseClassName(
        className
      )}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export default GradientButton;
