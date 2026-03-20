import GlassCard from "./GlassCard";
import Button from "./Button";

interface ErrorStateProps {
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

function ErrorState({ title = "Something went wrong", message, actionLabel, onAction }: ErrorStateProps) {
  return (
    <GlassCard className="border-rose-200 bg-rose-50 p-6">
      <h3 className="text-lg font-semibold text-rose-700">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-rose-600">{message}</p>
      {actionLabel && onAction ? (
        <Button type="button" variant="outline" onClick={onAction} className="mt-4 border-rose-200 bg-white text-rose-700 hover:bg-rose-100">
          {actionLabel}
        </Button>
      ) : null}
    </GlassCard>
  );
}

export default ErrorState;
