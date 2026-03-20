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
  return `inline-flex items-center justify-center rounded-2xl border border-cyan-200/80 bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-900 px-5 py-3 font-medium text-white shadow-[0_14px_32px_rgba(15,23,42,0.12)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(15,23,42,0.16)] disabled:cursor-not-allowed disabled:opacity-60 ${className}`;
}

function GradientButton(props: GradientButtonProps) {
  if ("to" in props && typeof props.to === "string") {
    const { children, className, to, ...rest } = props;
    return (
      <Link to={to} className={baseClassName(className)} {...rest}>
        {children}
      </Link>
    );
  }

  const { children, className, ...rest } = props;
  return (
    <button className={baseClassName(className)} {...rest}>
      {children}
    </button>
  );
}

export default GradientButton;
