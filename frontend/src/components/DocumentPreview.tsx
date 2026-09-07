import { forwardRef, type ReactNode } from "react";
import { buildFillValues } from "@/lib/fillValues";
import type { Clause, FieldSpec, DocumentType } from "@/lib/documentType";
import { displayValue, type FormData } from "@/lib/formData";
import { renderRichText } from "@/lib/renderRichText";

/**
 * Type hierarchy in the document, loudest to quietest. Each tier changes
 * family, size, weight AND colour, so a heading is never mistakable for the
 * label or the prose beneath it:
 *   SectionTitle  serif   1.15rem  semibold  ink        — outranks the body
 *   PartyLabel    mono    0.7rem   uppercase seal-dark  — names a column
 *   Caption       mono    0.6rem   uppercase slate      — names a field
 *   value         mono             .doc-fill seal-dark  — typed data
 *   body          serif   0.95rem            ink        — the agreement
 */
function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-serif text-[1.15rem] font-semibold tracking-tight text-ink mb-5">
      {children}
    </h2>
  );
}

function PartyLabel({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[0.7rem] tracking-[0.18em] uppercase text-seal-dark">
      {children}
    </p>
  );
}

/** Small caps caption. Every field carries one, so no value is ever unlabeled. */
function Caption({ children }: { children: ReactNode }) {
  return (
    <dt className="font-mono text-[0.6rem] tracking-[0.14em] uppercase text-slate">
      {children}
    </dt>
  );
}

/** A value the form supplies. No rule: nothing here is written by hand. */
function FieldValue({ value, className = "" }: { value: string; className?: string }) {
  const filled = value.trim().length > 0;
  return (
    <dd className={className}>
      <span className="doc-fill" data-empty={!filled}>
        {filled ? value : "—"}
      </span>
    </dd>
  );
}

/** A rule to actually sign or date on — the only lines left in the document. */
function SignatureLine({ label }: { label: string }) {
  return (
    <div>
      <div className="h-9 border-b border-rule" />
      <p className="mt-1 font-mono text-[0.6rem] tracking-[0.14em] uppercase text-slate">
        {label}
      </p>
    </div>
  );
}

function isParty(field: FieldSpec): boolean {
  return field.shared.startsWith("party");
}

function PartyBlock({
  label,
  fields,
  data,
}: {
  label: string;
  fields: FieldSpec[];
  data: FormData;
}) {
  const details = fields.filter((field) => !field.key.includes("signatory"));
  const signatory = fields.filter((field) => field.key.includes("signatory"));

  return (
    <div className="space-y-5">
      <PartyLabel>{label}</PartyLabel>
      <dl className="space-y-4 text-[0.95rem]">
        {details.map((field, index) => (
          <div key={field.key}>
            <Caption>{field.label}</Caption>
            <FieldValue
              value={displayValue(field, data)}
              className={index === 0 ? "font-semibold" : ""}
            />
          </div>
        ))}
      </dl>

      {/* Paper-white card on the tinted ground — one tint reads cleaner than two. */}
      <div className="rounded-md bg-paper px-5 py-5 space-y-5">
        <dl className="space-y-4 text-[0.9rem]">
          {signatory.map((field) => (
            <div key={field.key}>
              <Caption>{field.label.replace(/^Signatory /, "")}</Caption>
              <FieldValue value={displayValue(field, data)} />
            </div>
          ))}
        </dl>
        <SignatureLine label="Date" />
        <SignatureLine label="Signature" />
      </div>
    </div>
  );
}

function Clauses({
  clauses,
  values,
}: {
  clauses: Clause[];
  values: Record<string, { value: string; placeholder: string }>;
}) {
  return (
    <ol className="space-y-5 text-[0.95rem] leading-relaxed">
      {clauses.map((clause) => (
        <li key={clause.number} className="flex gap-3">
          <span className="text-slate tabular-nums shrink-0">{clause.number}.</span>
          <div className="space-y-4">
            <p>
              {clause.title && <strong>{clause.title}. </strong>}
              {renderRichText(clause.body, values)}
            </p>
            {clause.children.length > 0 && (
              <Clauses clauses={clause.children} values={values} />
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

const DocumentPreview = forwardRef<
  HTMLDivElement,
  { spec: DocumentType; data: FormData }
>(function DocumentPreview({ spec, data }, ref) {
  const values = buildFillValues(spec, data);
  const partySections = spec.sections.filter((section) =>
    spec.fields.some((field) => field.section === section && isParty(field)),
  );
  const termSections = spec.sections.filter((section) => !partySections.includes(section));

  return (
    <div
      ref={ref}
      className="print-sheet bg-paper text-ink font-serif px-8 py-10 sm:px-14 sm:py-16"
    >
      <header className="text-center mb-10 space-y-1.5">
        <p className="font-mono text-[0.7rem] tracking-[0.25em] uppercase text-slate">
          Cover Page
        </p>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">{spec.name}</h1>
        <p className="text-sm text-slate max-w-md mx-auto pt-1">{spec.intro}</p>
      </header>

      <section className="mb-14">
        <SectionTitle>Parties</SectionTitle>
        <div className="grid sm:grid-cols-2 gap-10 rounded-lg bg-[rgba(216,212,200,0.3)] px-7 py-8 sm:px-9 sm:py-9">
          {partySections.map((section) => (
            <PartyBlock
              key={section}
              label={section}
              fields={spec.fields.filter((field) => field.section === section)}
              data={data}
            />
          ))}
        </div>
      </section>

      {termSections.map((section) => (
        <section key={section} className="mb-14">
          <SectionTitle>{section}</SectionTitle>
          <dl className="grid sm:grid-cols-2 gap-x-10 gap-y-6 text-[0.95rem]">
            {spec.fields
              .filter((field) => field.section === section)
              .map((field) => (
                <div
                  key={field.key}
                  className={field.kind === "textarea" ? "sm:col-span-2" : ""}
                >
                  <Caption>{field.label}</Caption>
                  <FieldValue value={displayValue(field, data)} />
                </div>
              ))}
          </dl>
        </section>
      ))}

      <section>
        <SectionTitle>Standard Terms</SectionTitle>
        <Clauses clauses={spec.clauses} values={values} />
      </section>

      <footer className="mt-12 pt-6 border-t border-rule text-[0.7rem] text-slate">
        {spec.attribution}
      </footer>
    </div>
  );
});

export default DocumentPreview;
