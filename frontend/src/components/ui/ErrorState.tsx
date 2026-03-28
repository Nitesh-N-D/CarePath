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
    <GlassCard className="border-rose-200 bg-rose-50 p-5 dark:border-rose-500/30 dark:bg-rose-500/10 sm:p-6">
      <h3 className="text-lg font-semibold text-rose-700 dark:text-rose-200">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-rose-600 dark:text-rose-100/90">{message}</p>
      {actionLabel && onAction ? (
        <Button
          type="button"
          variant="outline"
          onClick={onAction}
          className="mt-4 w-full border-rose-200 bg-white text-rose-700 hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100 dark:hover:bg-rose-500/20 sm:w-auto"
        >
          {actionLabel}
        </Button>
      ) : null}
    </GlassCard>
  );
}

export default ErrorState;
