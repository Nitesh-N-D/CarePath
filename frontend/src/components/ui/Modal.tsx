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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 p-4 backdrop-blur-md">
      <GlassCard className="w-full max-w-xl p-6">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-full px-4 py-2"
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
