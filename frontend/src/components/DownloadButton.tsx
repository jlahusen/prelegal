"use client";

import { useState, type RefObject } from "react";

interface DownloadButtonProps {
  targetRef: RefObject<HTMLDivElement | null>;
  filename: string;
  /** The agreement being downloaded, e.g. "Cloud Service Agreement". */
  documentName: string;
  disabled: boolean;
}

export default function DownloadButton({
  targetRef,
  filename,
  documentName,
  disabled,
}: DownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    const node = targetRef.current;
    if (!node || disabled || isGenerating) return;

    setIsGenerating(true);
    setError(null);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      await html2pdf()
        .set({
          // Inches. Applies to every page, so clause text on pages 2+ doesn't
          // run flush to the paper edge (the sheet's own padding only pads p1).
          margin: 0.5,
          filename,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: "#fdfdfb" },
          jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
          // html2pdf.js supports `pagebreak` at runtime; the type.d.ts it
          // ships (which shadows @types/html2pdf.js) just hasn't caught up.
          pagebreak: { mode: ["css", "legacy"], avoid: ["li"] },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any)
        .from(node)
        .save();
    } catch (cause) {
      console.error("PDF generation failed", cause);
      setError("Couldn't generate the PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleDownload}
        disabled={disabled || isGenerating}
        className="w-full rounded-md bg-seal px-4 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-seal-dark disabled:cursor-not-allowed disabled:bg-[rgba(91,100,114,0.4)]"
      >
        {isGenerating
          ? "Preparing PDF…"
          : disabled
            ? "Fill in all fields to download"
            : `Download ${documentName} (PDF)`}
      </button>
      {error && (
        <p role="alert" className="mt-1.5 text-[0.8rem] text-seal-dark">
          {error}
        </p>
      )}
    </div>
  );
}
