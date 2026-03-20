import type { InputHTMLAttributes } from "react";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

function InputField({ label, className = "", placeholder = " ", ...props }: InputFieldProps) {
  return (
    <label className="relative block">
      <input
        placeholder={placeholder}
        className={`peer w-full rounded-2xl border border-slate-200 bg-white/95 px-4 pb-3 pt-6 text-slate-900 outline-none transition duration-300 placeholder:text-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] focus:border-cyan-300 focus:shadow-[0_0_0_4px_rgba(165,243,252,0.24)] ${className}`}
        {...props}
      />
      <span className="pointer-events-none absolute left-4 top-2 text-xs uppercase tracking-[0.18em] text-slate-400 transition duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:tracking-normal peer-focus:top-2 peer-focus:text-xs peer-focus:tracking-[0.18em] peer-focus:text-cyan-700">
        {label}
      </span>
    </label>
  );
}

export default InputField;
