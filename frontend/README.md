# Mutual NDA Creator

A minimalist Next.js app that turns a short form into a complete, ready-to-sign
Mutual NDA. Fill in the two parties and a handful of key terms on the left,
watch the document assemble itself on the right, and download it as a PDF
once every field is in — no account, no server-side storage.

The Standard Terms are the [Common Paper Mutual Non-Disclosure Agreement
v1.0](https://commonpaper.com/standards/mutual-nda/1.0/) (CC BY 4.0), also
vendored at [`../templates/Mutual-NDA.md`](../templates/Mutual-NDA.md).

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4
- [`html2pdf.js`](https://github.com/eKoopmans/html2pdf.js) for client-side PDF export — nothing is uploaded anywhere

## Known limitations

- **The exported PDF is a raster, not text.** `html2pdf.js` rasterises the DOM
  via `html2canvas`, so the PDF's text is not selectable or searchable, and the
  export reflects the layout at the exporter's current viewport width. Moving to
  a text-based generator (jsPDF's text API or `@react-pdf/renderer`) would fix
  both, at the cost of maintaining the document layout twice.
- **Signature and date are completed by hand.** Neither is collected in the
  form; the document leaves a ruled line for each, to be signed at execution.

## Structure

- `src/lib/types.ts` — form data shape and completeness checks
- `src/lib/mutualNdaTerms.ts` — Standard Terms text, transcribed from the template with cover-page placeholders tokenized
- `src/lib/renderRichText.tsx` — renders `**bold**` and `{{token}}` placeholders into the live document
- `src/components/NdaForm.tsx`, `NdaDocument.tsx`, `SealStamp.tsx`, `DownloadButton.tsx`
- `src/app/page.tsx` — split form/preview layout
