import { useId, useState, type InputHTMLAttributes } from "react";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  inputClassName?: string;
}

function InputField({ label, className = "", inputClassName = "", placeholder, error, ...props }: InputFieldProps) {
  const inputId = useId();
  const isPasswordField = props.type === "password";
  const [passwordVisible, setPasswordVisible] = useState(false);
  const resolvedType = isPasswordField ? (passwordVisible ? "text" : "password") : props.type;
  const resolvedPlaceholder =
    placeholder ?? (resolvedType === "password" ? `Enter your ${label.toLowerCase()}` : `Enter ${label.toLowerCase()}`);

  return (
    <div className={className}>
      <label
        htmlFor={inputId}
        className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          placeholder={resolvedPlaceholder}
          type={resolvedType}
          className={`field-shell w-full rounded-xl px-4 py-3 placeholder:text-slate-400 dark:placeholder:text-slate-500 ${
            isPasswordField ? "pr-14" : ""
          } ${error ? "border-rose-300 focus:border-rose-400 focus:ring-rose-200/70 dark:border-rose-500/40 dark:focus:border-rose-400 dark:focus:ring-rose-500/20" : ""} ${inputClassName}`}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {isPasswordField ? (
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setPasswordVisible((current) => !current)}
            className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-borderLight bg-white/90 text-slate-600 shadow-sm transition-all duration-300 hover:bg-primary/5 hover:text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-borderDark dark:bg-cardDark/90 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-textDark dark:focus:ring-accent/20"
            aria-label={passwordVisible ? "Hide password" : "Show password"}
            aria-pressed={passwordVisible}
          >
            {passwordVisible ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3l18 18" strokeLinecap="round" />
                <path d="M10.6 10.7a2 2 0 0 0 2.7 2.7" strokeLinecap="round" />
                <path d="M9.4 5.5A10.7 10.7 0 0 1 12 5.2c5 0 8.4 4.1 9.5 6.1a1.2 1.2 0 0 1 0 1.1 16.3 16.3 0 0 1-4 4.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6.2 6.3a16.6 16.6 0 0 0-3.7 5 1.2 1.2 0 0 0 0 1.1c1.1 2 4.5 6.1 9.5 6.1a10.8 10.8 0 0 0 3-.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2.5 12s3.5-6.8 9.5-6.8 9.5 6.8 9.5 6.8-3.5 6.8-9.5 6.8S2.5 12 2.5 12Z" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        ) : null}
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="mt-2 text-sm text-rose-600 dark:text-rose-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default InputField;
