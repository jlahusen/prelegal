"use client";

import { useMemo, useRef, useState } from "react";
import DocumentChat from "@/components/DocumentChat";
import DocumentForm from "@/components/DocumentForm";
import DocumentPicker from "@/components/DocumentPicker";
import DocumentPreview from "@/components/DocumentPreview";
import DownloadButton from "@/components/DownloadButton";
import SaveDraftButton from "@/components/SaveDraftButton";
import SealStamp from "@/components/SealStamp";
import { isComplete } from "@/lib/formData";
import { useDraft } from "@/lib/useDraft";

function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * What gets struck into the seal: "Cloud Service Agreement" becomes "CSA",
 * and "Mutual Non-Disclosure Agreement" keeps its hyphenated word, "MNDA".
 */
function initials(name: string): string {
  return name
    .split(/[\s-]+/)
    .filter((word) => /^[A-Z]/.test(word))
    .map((word) => (word === word.toUpperCase() ? word : word[0]))
    .join("")
    .slice(0, 4);
}

export default function Home() {
  const { spec, data, update, applyUpdates, save, status, switchTo, wouldLose } = useDraft();
  const [mobileView, setMobileView] = useState<"fill" | "preview">("fill");
  const [fillMode, setFillMode] = useState<"chat" | "form">("chat");
  const documentRef = useRef<HTMLDivElement>(null);

  const complete = useMemo(() => (spec ? isComplete(spec, data) : false), [spec, data]);

  const filename = useMemo(() => {
    if (!spec) return "agreement.pdf";
    const parties = spec.fields
      .filter((field) => field.key.endsWith(".name") && field.shared.startsWith("party"))
      .map((field) => slugify(data[field.key] ?? ""));
    const named = parties.filter(Boolean);
    return [slugify(spec.name), ...(named.length ? named : ["draft"])].join("-") + ".pdf";
  }, [spec, data]);

  if (!spec) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-slate">
          Loading…
        </p>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="no-print border-b border-rule bg-[rgba(242,243,238,0.95)] backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="font-mono text-[0.7rem] tracking-[0.2em] uppercase text-slate">
              Prelegal
            </p>
            <h1 className="font-serif text-lg font-semibold">{spec.name}</h1>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate">
            <span aria-live="polite" className="hidden sm:inline">
              {complete ? "Ready to seal" : "Fill in the form to continue"}
            </span>
            <span aria-live="polite" className="sm:hidden">
              {complete ? "Ready" : "Draft"}
            </span>
          </div>
        </div>
        <nav className="lg:hidden flex border-t border-rule">
          {(["fill", "preview"] as const).map((view) => (
            <button
              key={view}
              type="button"
              onClick={() => setMobileView(view)}
              className={`flex-1 py-2.5 text-sm font-medium capitalize transition-colors ${
                mobileView === view ? "text-seal border-b-2 border-seal" : "text-slate"
              }`}
            >
              {view === "fill" ? "Fill in" : "Preview"}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto grid w-full max-w-7xl flex-1 gap-8 px-6 py-8 lg:grid-cols-[400px_1fr]">
        <section className={`${mobileView === "fill" ? "block" : "hidden"} lg:block`}>
          <div className="lg:sticky lg:top-8 space-y-4">
            <DocumentPicker
              docType={spec.doc_type}
              wouldLose={wouldLose}
              onPick={(next) => void switchTo(next)}
            />

            <div className="flex gap-1 rounded-md border border-rule p-1">
              {(["chat", "form"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setFillMode(mode)}
                  className={`flex-1 rounded px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.2em] transition-colors ${
                    fillMode === mode ? "bg-seal text-paper" : "text-slate hover:text-ink"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Both stay mounted so the conversation survives a tab switch. */}
            <div className={fillMode === "chat" ? "block" : "hidden"}>
              <DocumentChat
                spec={spec}
                data={data}
                onApply={applyUpdates}
                onChooseDocument={(next) => void switchTo(next)}
              />
            </div>
            <div className={fillMode === "form" ? "block" : "hidden"}>
              <DocumentForm spec={spec} data={data} onChange={update} />
            </div>
          </div>
        </section>

        <section className={`${mobileView === "preview" ? "block" : "hidden"} lg:block`}>
          <div className="lg:sticky lg:top-8 space-y-4">
            <div className="flex items-start justify-between gap-4 no-print">
              <div className="max-w-xs space-y-2">
                <DownloadButton
                  targetRef={documentRef}
                  filename={filename}
                  disabled={!complete}
                />
                <SaveDraftButton onSave={save} status={status} />
              </div>
              <SealStamp sealed={complete} label={initials(spec.name)} />
            </div>

            <div className="preview-frame overflow-hidden rounded-lg border border-rule shadow-[0_1px_2px_rgba(28,31,42,0.06),0_12px_32px_-16px_rgba(28,31,42,0.25)]">
              <div className="preview-scroll max-h-[75vh] overflow-y-auto">
                <DocumentPreview ref={documentRef} spec={spec} data={data} />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="no-print border-t border-rule px-6 py-4 text-center text-xs text-slate">
        Built on the{" "}
        <a
          className="underline decoration-rule underline-offset-2 hover:text-seal"
          href="https://commonpaper.com/"
          target="_blank"
          rel="noreferrer"
        >
          Common Paper standards
        </a>{" "}
        (CC BY 4.0). Not legal advice.
      </footer>
    </div>
  );
}
