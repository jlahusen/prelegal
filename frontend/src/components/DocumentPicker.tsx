"use client";

import { useEffect, useState } from "react";
import ConfirmDialog from "@/components/ConfirmDialog";
import { fetchCatalog, type CatalogEntry } from "@/lib/api";

interface DocumentPickerProps {
  docType: string;
  /** Anything has been entered, so switching must be confirmed first. */
  dirty: boolean;
  onPick: (docType: string) => void;
}

export default function DocumentPicker({ docType, dirty, onPick }: DocumentPickerProps) {
  const [catalog, setCatalog] = useState<CatalogEntry[]>([]);
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    fetchCatalog().then(setCatalog).catch(() => setCatalog([]));
  }, []);

  function choose(next: string) {
    if (next === docType) return;
    if (dirty) setPending(next);
    else onPick(next);
  }

  const chosen = catalog.find((entry) => entry.filename === docType);
  const target = catalog.find((entry) => entry.filename === pending);

  return (
    <div className="space-y-2">
      <label
        htmlFor="document-type"
        className="block font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate"
      >
        Document
      </label>
      <select
        id="document-type"
        value={docType}
        onChange={(e) => choose(e.target.value)}
        className="w-full rounded-md border border-rule bg-paper px-3 py-2 text-[0.925rem] text-ink transition-colors focus:border-seal focus:outline-none focus:ring-2 focus:ring-[rgba(178,58,46,0.4)]"
      >
        {catalog.map((entry) => (
          <option key={entry.filename} value={entry.filename}>
            {entry.name}
          </option>
        ))}
      </select>
      {chosen && <p className="text-[0.75rem] text-slate">{chosen.description}</p>}

      <ConfirmDialog
        open={pending !== null}
        title={`Start a ${target?.name ?? "new agreement"}?`}
        message={
          "Switching templates starts over from a blank draft. Everything you have " +
          "filled in so far, and the chat conversation, will be lost."
        }
        confirmLabel="Discard and switch"
        cancelLabel="Keep drafting"
        onConfirm={() => {
          if (pending) onPick(pending);
          setPending(null);
        }}
        onCancel={() => setPending(null)}
      />
    </div>
  );
}
