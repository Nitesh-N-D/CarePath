interface ToastProps {
  message: string;
  tone?: "success" | "error";
}

function Toast({ message, tone = "success" }: ToastProps) {
  const toneClass =
    tone === "success"
      ? "border-emerald-200 bg-white text-emerald-700"
      : "border-rose-200 bg-white text-rose-700";

  return (
    <div className={`fixed bottom-6 right-6 z-50 rounded-2xl border px-4 py-3 text-sm shadow-xl backdrop-blur-xl ${toneClass}`}>
      {message}
    </div>
  );
}

export default Toast;
