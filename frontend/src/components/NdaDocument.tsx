import { forwardRef } from "react";
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
    ? "in perpetuity"
    : formatDuration(data.confidentialityTermValue, data.confidentialityTermUnit);

  return {
    purpose: { label: "the Purpose", value: data.purpose.trim() },
    effectiveDate: {
      label: "the Effective Date",
      value: formatDate(data.effectiveDate),
    },
    mndaTerm: {
      label: "the MNDA Term",
      value: formatDuration(data.mndaTermValue, data.mndaTermUnit),
    },
    confidentialityTerm: {
      label: "the Term of Confidentiality",
      value: confidentialityValue,
    },
    governingLaw: { label: "Governing Law", value: data.governingLaw.trim() },
    jurisdiction: { label: "the Jurisdiction", value: data.jurisdiction.trim() },
  };
}

function Blank({ value, lines = 1 }: { value: string; lines?: number }) {
  if (value.trim()) {
    return <span className="doc-fill" data-empty="false">{value}</span>;
  }
  return (
    <span
      className="doc-fill inline-block align-bottom border-b border-rule"
      data-empty="true"
      style={{ minWidth: `${lines * 6}rem` }}
    >
      &nbsp;
    </span>
  );
}

function PartyBlock({ label, party }: { label: string; party: PartyInfo }) {
  return (
    <div className="space-y-2.5">
      <p className="font-mono text-[0.7rem] tracking-[0.18em] uppercase text-slate">
        {label}
      </p>
      <dl className="space-y-1.5 text-[0.95rem]">
        <div>
          <dt className="sr-only">Legal name</dt>
          <dd className="font-semibold">
            <Blank value={party.name} lines={4} />
          </dd>
        </div>
        <div>
          <dt className="sr-only">Address</dt>
          <dd className="text-ink/80 whitespace-pre-line">
            <Blank value={party.address} lines={4} />
          </dd>
        </div>
      </dl>
      <div className="pt-3 space-y-1 text-[0.85rem]">
        <p>
          Signature: <Blank value="" lines={5} />
        </p>
        <p>
          Name: <Blank value={party.signatoryName} lines={4} />
        </p>
        <p>
          Title: <Blank value={party.signatoryTitle} lines={4} />
        </p>
        <p>
          Date: <Blank value="" lines={4} />
        </p>
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

        <section className="grid sm:grid-cols-2 gap-8 border-y border-rule py-8 mb-8">
          <PartyBlock label="Party 1" party={data.partyA} />
          <PartyBlock label="Party 2" party={data.partyB} />
        </section>

        <section className="mb-10">
          <p className="font-mono text-[0.7rem] tracking-[0.18em] uppercase text-slate mb-3">
            Key Terms
          </p>
          <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-[0.95rem]">
            <div className="sm:col-span-2">
              <dt className="text-slate text-sm">Purpose</dt>
              <dd>
                <Blank value={data.purpose} lines={10} />
              </dd>
            </div>
            <div>
              <dt className="text-slate text-sm">Effective Date</dt>
              <dd>
                <Blank value={formatDate(data.effectiveDate)} />
              </dd>
            </div>
            <div>
              <dt className="text-slate text-sm">MNDA Term</dt>
              <dd>
                <Blank
                  value={formatDuration(data.mndaTermValue, data.mndaTermUnit)}
                />
              </dd>
            </div>
            <div>
              <dt className="text-slate text-sm">Term of Confidentiality</dt>
              <dd>
                <Blank
                  value={
                    data.confidentialityPerpetual
                      ? "In perpetuity"
                      : formatDuration(
                          data.confidentialityTermValue,
                          data.confidentialityTermUnit,
                        )
                  }
                />
              </dd>
            </div>
            <div>
              <dt className="text-slate text-sm">Governing Law</dt>
              <dd>
                <Blank value={data.governingLaw} />
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-slate text-sm">Jurisdiction</dt>
              <dd>
                <Blank value={data.jurisdiction} lines={6} />
              </dd>
            </div>
          </dl>
        </section>

        <section>
          <p className="font-mono text-[0.7rem] tracking-[0.18em] uppercase text-slate mb-4">
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
