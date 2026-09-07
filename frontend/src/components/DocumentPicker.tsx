"use client";

import { useEffect, useState } from "react";
import { fetchCatalog, type CatalogEntry } from "@/lib/api";

interface DocumentPickerProps {
  docType: string;
  /** Named so the reader can decide before anything is discarded. */
  wouldLose: (docType: string) => Promise<string[]>;
  onPick: (docType: string) => void;
}

export default function DocumentPicker({ docType, wouldLose, onPick }: DocumentPickerProps) {
  const [catalog, setCatalog] = useState<CatalogEntry[]>([]);
  const [pending, setPending] = useState<{ docType: string; losing: string[] } | null>(null);

  useEffect(() => {
    fetchCatalog().then(setCatalog).catch(() => setCatalog([]));
  }, []);

  async function choose(next: string) {
    if (next === docType) return;
    const losing = await wouldLose(next);
    if (losing.length === 0) {
      onPick(next);
      return;
    }
    setPending({ docType: next, losing });
  }

  const chosen = catalog.find((entry) => entry.filename === docType);

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
        onChange={(e) => void choose(e.target.value)}
        className="w-full rounded-md border border-rule bg-paper px-3 py-2 text-[0.925rem] text-ink transition-colors focus:border-seal focus:outline-none focus:ring-2 focus:ring-[rgba(178,58,46,0.4)]"
      >
        {catalog.map((entry) => (
          <option key={entry.filename} value={entry.filename}>
            {entry.name}
          </option>
        ))}
      </select>
      {chosen && <p className="text-[0.75rem] text-slate">{chosen.description}</p>}

      {pending && (
        <div
          role="alertdialog"
          aria-label="Confirm document change"
          className="space-y-3 rounded-md border border-seal bg-[rgba(216,212,200,0.3)] p-3"
        >
          <p className="text-[0.8rem] text-ink">
            Switching keeps the parties and the shared terms. You would lose what you
            entered for: <span className="font-medium">{pending.losing.join(", ")}</span>.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                onPick(pending.docType);
                setPending(null);
              }}
              className="rounded-md bg-seal px-3 py-1.5 text-[0.8rem] font-medium text-paper transition-colors hover:bg-seal-dark"
            >
              Switch anyway
            </button>
            <button
              type="button"
              onClick={() => setPending(null)}
              className="rounded-md border border-rule px-3 py-1.5 text-[0.8rem] text-slate transition-colors hover:text-ink"
            >
              Keep drafting
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
