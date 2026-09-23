"use client";

import { useEffect, useRef } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** A modal question in the house style. Escape and the backdrop both cancel. */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="confirm-dialog-title"
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
      className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-lg border border-rule bg-paper p-0 text-ink shadow-[0_24px_48px_-16px_rgba(28,31,42,0.45)] backdrop:bg-[rgba(28,31,42,0.55)] backdrop:backdrop-blur-sm"
    >
      <div className="border-t-4 border-seal p-6 space-y-4">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-seal-dark">
          Prelegal
        </p>
        <h2 id="confirm-dialog-title" className="font-serif text-xl font-semibold">
          {title}
        </h2>
        <p className="text-[0.9rem] leading-relaxed text-slate">{message}</p>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            autoFocus
            onClick={onCancel}
            className="rounded-md border border-rule px-4 py-2 text-[0.85rem] text-slate transition-colors hover:text-ink"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-md bg-seal px-4 py-2 text-[0.85rem] font-medium text-paper transition-colors hover:bg-seal-dark"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
