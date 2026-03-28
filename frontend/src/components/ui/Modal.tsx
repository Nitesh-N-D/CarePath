import type { ReactNode } from "react";

import Button from "./Button";
import GlassCard from "./GlassCard";

interface ModalProps {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}

function Modal({ open, title, children, onClose }: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/30 p-3 backdrop-blur-md sm:items-center sm:p-4">
      <GlassCard className="max-h-[90vh] w-full max-w-xl overflow-y-auto p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full rounded-full px-4 py-2 sm:w-auto"
          >
            Close
          </Button>
        </div>
        <div className="mt-6">{children}</div>
      </GlassCard>
    </div>
  );
}

export default Modal;
