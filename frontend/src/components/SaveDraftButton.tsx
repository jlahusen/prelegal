"use client";

import type { DraftStatus } from "@/lib/useDraft";

const STATUS_LABEL: Record<DraftStatus, string> = {
  idle: "",
  saving: "Saving…",
  saved: "Draft saved — this link reopens it",
  error: "Couldn't reach the server",
};

interface SaveDraftButtonProps {
  onSave: () => void;
  status: DraftStatus;
}

export default function SaveDraftButton({
  onSave,
  status,
}: SaveDraftButtonProps) {
  return (
    <div>
      <button
        type="button"
        onClick={onSave}
        disabled={status === "saving"}
        className="w-full rounded-md border border-rule px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-seal hover:text-seal disabled:cursor-not-allowed disabled:text-slate"
      >
        Save draft
      </button>
      {STATUS_LABEL[status] && (
        <p
          aria-live="polite"
          className={`mt-1.5 text-[0.8rem] ${
            status === "error" ? "text-seal-dark" : "text-slate"
          }`}
        >
          {STATUS_LABEL[status]}
        </p>
      )}
    </div>
  );
}
