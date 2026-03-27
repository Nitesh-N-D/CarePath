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
  return `inline-flex items-center justify-center rounded-2xl border px-5 py-3 font-semibold text-white shadow-[0_14px_32px_rgba(38,31,26,0.18)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(38,31,26,0.22)] disabled:cursor-not-allowed disabled:opacity-60 ${className}`;
}

function GradientButton(props: GradientButtonProps) {
  if ("to" in props && typeof props.to === "string") {
    const { children, className, to, ...rest } = props;
    return (
      <Link
        to={to}
        className={`border-[rgba(166,124,82,0.28)] bg-[linear-gradient(135deg,#183c38_0%,#31544d_58%,#8b6a46_100%)] ${baseClassName(
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
      className={`border-[rgba(166,124,82,0.28)] bg-[linear-gradient(135deg,#183c38_0%,#31544d_58%,#8b6a46_100%)] ${baseClassName(
        className
      )}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export default GradientButton;
