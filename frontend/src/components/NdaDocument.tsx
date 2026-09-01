import { forwardRef, type ReactNode } from "react";
import type { FillValue } from "@/lib/renderRichText";
import { renderRichText } from "@/lib/renderRichText";
import {
  formatDate,
  formatDuration,
  type NdaFormData,
  type PartyInfo,
} from "@/lib/types";
import { STANDARD_TERMS, STANDARD_TERMS_ATTRIBUTION } from "@/lib/mutualNdaTerms";

function buildFillValues(data: NdaFormData): Record<string, FillValue> {
  const confidentialityValue = data.confidentialityPerpetual
    ? "perpetuity"
    : formatDuration(data.confidentialityTermValue, data.confidentialityTermUnit);

  return {
    purpose: { placeholder: "Purpose", value: data.purpose.trim() },
    effectiveDate: {
      placeholder: "the Effective Date",
      value: formatDate(data.effectiveDate),
    },
    mndaTerm: {
      placeholder: "the MNDA Term",
      value: formatDuration(data.mndaTermValue, data.mndaTermUnit),
    },
    confidentialityTerm: {
      placeholder: "the Term of Confidentiality",
      value: confidentialityValue,
    },
    governingLaw: { placeholder: "Governing Law", value: data.governingLaw.trim() },
    jurisdiction: {
      placeholder: "the Jurisdiction",
      value: data.jurisdiction.trim(),
    },
  };
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
function FieldValue({
  value,
  className = "",
}: {
  value: string;
  className?: string;
}) {
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
      <div className="h-7 border-b border-rule" />
      <p className="mt-1 font-mono text-[0.6rem] tracking-[0.14em] uppercase text-slate">
        {label}
      </p>
    </div>
  );
}

function PartyBlock({ label, party }: { label: string; party: PartyInfo }) {
  return (
    <div className="space-y-3">
      <p className="font-mono text-[0.7rem] tracking-[0.18em] uppercase text-seal-dark">
        {label}
      </p>
      <dl className="space-y-2 text-[0.95rem]">
        <div>
          <Caption>Legal name</Caption>
          <FieldValue value={party.name} className="font-semibold" />
        </div>
        <div>
          <Caption>Address</Caption>
          <FieldValue value={party.address} />
        </div>
      </dl>

      <div className="rounded-md bg-[rgba(216,212,200,0.32)] px-4 py-3.5 space-y-3">
        <dl className="space-y-2 text-[0.9rem]">
          <div>
            <Caption>Name</Caption>
            <FieldValue value={party.signatoryName} />
          </div>
          <div>
            <Caption>Title</Caption>
            <FieldValue value={party.signatoryTitle} />
          </div>
        </dl>
        <SignatureLine label="Date" />
        <SignatureLine label="Signature" />
      </div>
    </div>
  );
}

const NdaDocument = forwardRef<HTMLDivElement, { data: NdaFormData }>(
  function NdaDocument({ data }, ref) {
    const fillValues = buildFillValues(data);

    return (
      <div
        ref={ref}
        className="print-sheet bg-paper text-ink font-serif px-8 py-10 sm:px-14 sm:py-16"
      >
        <header className="text-center mb-10 space-y-1.5">
          <p className="font-mono text-[0.7rem] tracking-[0.25em] uppercase text-slate">
            Cover Page
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Mutual Non-Disclosure Agreement
          </h1>
          <p className="text-sm text-slate max-w-md mx-auto pt-1">
            This Cover Page incorporates by reference the Standard Terms
            below to form the parties&rsquo; MNDA.
          </p>
        </header>

        <section className="grid sm:grid-cols-2 gap-8 rounded-lg bg-[rgba(216,212,200,0.18)] px-6 py-7 mb-9">
          <PartyBlock label="Party 1" party={data.partyA} />
          <PartyBlock label="Party 2" party={data.partyB} />
        </section>

        <section className="mb-10">
          <p className="font-mono text-[0.7rem] tracking-[0.18em] uppercase text-seal-dark mb-3">
            Key Terms
          </p>
          <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-3.5 text-[0.95rem]">
            <div className="sm:col-span-2">
              <Caption>Purpose</Caption>
              <FieldValue value={data.purpose} />
            </div>
            <div>
              <Caption>Effective Date</Caption>
              <FieldValue value={formatDate(data.effectiveDate)} />
            </div>
            <div>
              <Caption>MNDA Term</Caption>
              <FieldValue
                value={formatDuration(data.mndaTermValue, data.mndaTermUnit)}
              />
            </div>
            <div>
              <Caption>Term of Confidentiality</Caption>
              <FieldValue
                value={
                  data.confidentialityPerpetual
                    ? "In perpetuity"
                    : formatDuration(
                        data.confidentialityTermValue,
                        data.confidentialityTermUnit,
                      )
                }
              />
            </div>
            <div>
              <Caption>Governing Law</Caption>
              <FieldValue value={data.governingLaw} />
            </div>
            <div className="sm:col-span-2">
              <Caption>Jurisdiction</Caption>
              <FieldValue value={data.jurisdiction} />
            </div>
          </dl>
        </section>

        <section>
          <p className="font-mono text-[0.7rem] tracking-[0.18em] uppercase text-seal-dark mb-4">
            Standard Terms
          </p>
          <ol className="space-y-5 text-[0.95rem] leading-relaxed">
            {STANDARD_TERMS.map((term) => (
              <li key={term.number} className="flex gap-3">
                <span className="text-slate tabular-nums shrink-0">
                  {term.number}.
                </span>
                <p>
                  <strong>{term.title}.</strong>{" "}
                  {renderRichText(term.body, fillValues)}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <footer className="mt-12 pt-6 border-t border-rule text-[0.7rem] text-slate">
          {STANDARD_TERMS_ATTRIBUTION}
        </footer>
      </div>
    );
  },
);

export default NdaDocument;
