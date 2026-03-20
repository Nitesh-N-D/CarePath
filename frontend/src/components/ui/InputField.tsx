import { useState, type InputHTMLAttributes } from "react";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

function InputField({ label, className = "", placeholder = " ", ...props }: InputFieldProps) {
  const isPasswordField = props.type === "password";
  const [passwordVisible, setPasswordVisible] = useState(false);
  const resolvedType = isPasswordField ? (passwordVisible ? "text" : "password") : props.type;

  return (
    <label className="relative block">
      <input
        placeholder={placeholder}
        type={resolvedType}
        className={`peer w-full rounded-2xl border border-slate-200 bg-white/95 px-4 pb-3 pt-6 text-slate-900 outline-none transition duration-300 placeholder:text-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] focus:border-cyan-300 focus:shadow-[0_0_0_4px_rgba(165,243,252,0.24)] ${isPasswordField ? "pr-14" : ""} ${className}`}
        {...props}
      />
      <span className="pointer-events-none absolute left-4 top-2 text-xs uppercase tracking-[0.18em] text-slate-400 transition duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:tracking-normal peer-focus:top-2 peer-focus:text-xs peer-focus:tracking-[0.18em] peer-focus:text-cyan-700">
        {label}
      </span>
      {isPasswordField ? (
        <button
          type="button"
          onClick={() => setPasswordVisible((current) => !current)}
          className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 transition duration-200 hover:bg-slate-100 hover:text-slate-800"
          aria-label={passwordVisible ? "Hide password" : "Show password"}
        >
          {passwordVisible ? (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 3l18 18" strokeLinecap="round" />
              <path d="M10.6 10.7a2 2 0 0 0 2.7 2.7" strokeLinecap="round" />
              <path d="M9.4 5.5A10.7 10.7 0 0 1 12 5.2c5 0 8.4 4.1 9.5 6.1a1.2 1.2 0 0 1 0 1.1 16.3 16.3 0 0 1-4 4.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6.2 6.3a16.6 16.6 0 0 0-3.7 5 1.2 1.2 0 0 0 0 1.1c1.1 2 4.5 6.1 9.5 6.1a10.8 10.8 0 0 0 3-.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M2.5 12s3.5-6.8 9.5-6.8 9.5 6.8 9.5 6.8-3.5 6.8-9.5 6.8S2.5 12 2.5 12Z" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      ) : null}
    </label>
  );
}

export default InputField;
