"use client";

import { useState, type RefObject } from "react";

interface DownloadButtonProps {
  targetRef: RefObject<HTMLDivElement | null>;
  filename: string;
  disabled: boolean;
}

export default function DownloadButton({
  targetRef,
  filename,
  disabled,
}: DownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleDownload() {
    const node = targetRef.current;
    if (!node || disabled || isGenerating) return;

    setIsGenerating(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      await html2pdf()
        .set({
          margin: 0,
          filename,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: "#fdfdfb" },
          jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
        })
        .from(node)
        .save();
    } finally {
      setIsGenerating(false);
    }
  }

  return (
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
          : "Download NDA (PDF)"}
    </button>
  );
}
