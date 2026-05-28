import * as React from "react";
import { cn } from "@/lib/utils";

type ModalProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> & {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  actions?: React.ReactNode;
};

export function Modal({ open, onClose, title, children, actions, className, ...props }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className={cn("bg-white rounded-lg shadow-lg max-w-lg w-full mx-4 z-10", className)} {...props}>
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <div className="p-4">{children}</div>
        {actions && <div className="p-4 border-t flex justify-end gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export default Modal;
