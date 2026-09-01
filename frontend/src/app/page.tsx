"use client";

import { useMemo, useRef, useState } from "react";
import NdaForm from "@/components/NdaForm";
import NdaDocument from "@/components/NdaDocument";
import SealStamp from "@/components/SealStamp";
import DownloadButton from "@/components/DownloadButton";
import { emptyNdaFormData, isNdaComplete, type NdaFormData } from "@/lib/types";

function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function Home() {
  const [data, setData] = useState<NdaFormData>(emptyNdaFormData);
  const [mobileView, setMobileView] = useState<"fill" | "preview">("fill");
  const documentRef = useRef<HTMLDivElement>(null);

  const complete = useMemo(() => isNdaComplete(data), [data]);

  const filename = useMemo(() => {
    const a = slugify(data.partyA.name) || "party-1";
    const b = slugify(data.partyB.name) || "party-2";
    return `mutual-nda-${a}-${b}.pdf`;
  }, [data.partyA.name, data.partyB.name]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="no-print border-b border-rule bg-[rgba(242,243,238,0.95)] backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="font-mono text-[0.7rem] tracking-[0.2em] uppercase text-slate">
              Prelegal
            </p>
            <h1 className="font-serif text-lg font-semibold">
              Mutual NDA Creator
            </h1>
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
                mobileView === view
                  ? "text-seal border-b-2 border-seal"
                  : "text-slate"
              }`}
            >
              {view === "fill" ? "Fill in" : "Preview"}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto grid w-full max-w-7xl flex-1 gap-8 px-6 py-8 lg:grid-cols-[400px_1fr]">
        <section
          className={`${mobileView === "fill" ? "block" : "hidden"} lg:block`}
        >
          <div className="lg:sticky lg:top-8 space-y-6">
            <NdaForm data={data} onChange={setData} />
          </div>
        </section>

        <section
          className={`${mobileView === "preview" ? "block" : "hidden"} lg:block`}
        >
          <div className="lg:sticky lg:top-8 space-y-4">
            <div className="flex items-start justify-between gap-4 no-print">
              <div className="max-w-xs">
                <DownloadButton
                  targetRef={documentRef}
                  filename={filename}
                  disabled={!complete}
                />
              </div>
              <SealStamp sealed={complete} />
            </div>

            <div className="preview-frame overflow-hidden rounded-lg border border-rule shadow-[0_1px_2px_rgba(28,31,42,0.06),0_12px_32px_-16px_rgba(28,31,42,0.25)]">
              <div className="preview-scroll max-h-[75vh] overflow-y-auto">
                <NdaDocument ref={documentRef} data={data} />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="no-print border-t border-rule px-6 py-4 text-center text-xs text-slate">
        Built on the{" "}
        <a
          className="underline decoration-rule underline-offset-2 hover:text-seal"
          href="https://commonpaper.com/standards/mutual-nda/1.0/"
          target="_blank"
          rel="noreferrer"
        >
          Common Paper Mutual NDA
        </a>{" "}
        (CC BY 4.0). Not legal advice.
      </footer>
    </div>
  );
}
