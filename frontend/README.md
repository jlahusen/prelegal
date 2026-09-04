# Prelegal frontend

A minimalist Next.js app that turns a conversation or a short form into a
complete, ready-to-sign agreement. Pick a document, fill it in on the left,
watch it assemble itself on the right, and download it as a PDF once every
field is in — no account, no server-side storage.

Every agreement in [`../catalog.json`](../catalog.json) can be drafted. The
Standard Terms are the [Common Paper](https://commonpaper.com/) standards
(CC BY 4.0), vendored at [`../templates/`](../templates/).

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Point it at a local
backend with `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000`.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4
- [`html2pdf.js`](https://github.com/eKoopmans/html2pdf.js) for client-side PDF export — nothing is uploaded anywhere

## How a document gets drawn

Nothing here is written per agreement. `GET /api/document-types/{docType}`
returns the fields to draw and the clauses to render, so the form, the preview
and the chat all work the same way for every document in the catalog, and
adding one needs no change in this directory.

A clause carries `{{token}}` markers where a value belongs. A field that is
`inline: false` keeps its defined term in the prose and shows its value on the
cover page instead, because substituting reads badly for terms the agreement
defines rather than states.

## Structure

- `src/lib/documentType.ts` — the shape of an agreement, as the backend describes it
- `src/lib/formData.ts` — the values entered, completeness, and what carries across a change of document
- `src/lib/fillValues.ts` — the values the clauses interpolate, including possessive and plural forms
- `src/lib/documentChat.ts` — applying the fields a chat turn settled
- `src/lib/useDraft.ts` — the draft being edited, saved, and switched
- `src/lib/renderRichText.tsx` — renders `**bold**` and `{{token}}` placeholders into the live document
- `src/components/DocumentPicker.tsx`, `DocumentForm.tsx`, `DocumentChat.tsx`, `DocumentPreview.tsx`, `SealStamp.tsx`, `DownloadButton.tsx`
- `src/app/page.tsx` — split fill/preview layout

## Known limitations

- **The exported PDF is a raster, not text.** `html2pdf.js` rasterises the DOM
  via `html2canvas`, so the PDF's text is not selectable or searchable, and the
  export reflects the layout at the exporter's current viewport width. Moving to
  a text-based generator (jsPDF's text API or `@react-pdf/renderer`) would fix
  both, at the cost of maintaining the document layout twice.
- **Signature and date are completed by hand.** Neither is collected in the
  form; the document leaves a ruled line for each, to be signed at execution.
- **Addenda do not know their parent.** The SLA, DPA and AI Addendum supplement
  another agreement, and name it as a field rather than linking to a draft of it.
