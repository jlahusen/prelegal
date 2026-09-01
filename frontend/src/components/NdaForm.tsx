"use client";

import type { ChangeEvent, ReactNode } from "react";
import type { DurationUnit, NdaFormData, PartyInfo } from "@/lib/types";

interface NdaFormProps {
  data: NdaFormData;
  onChange: (data: NdaFormData) => void;
}

const inputClasses =
  "w-full rounded-md border border-rule bg-paper px-3 py-2 text-[0.925rem] text-ink placeholder:text-[rgba(91,100,114,0.6)] focus:outline-none focus:ring-2 focus:ring-[rgba(178,58,46,0.4)] focus:border-seal transition-colors";

function Field({
  label,
  htmlFor,
  children,
  hint,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-[0.8rem] font-medium text-[rgba(28,31,42,0.85)]"
      >
        {label}
      </label>
      {children}
      {hint && <p className="text-[0.75rem] text-slate">{hint}</p>}
    </div>
  );
}

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-mono text-[0.7rem] tracking-[0.2em] uppercase text-slate pb-3 border-b border-rule">
      {children}
    </h2>
  );
}

function DurationInput({
  idPrefix,
  value,
  unit,
  onValueChange,
  onUnitChange,
}: {
  idPrefix: string;
  value: string;
  unit: DurationUnit;
  onValueChange: (v: string) => void;
  onUnitChange: (u: DurationUnit) => void;
}) {
  return (
    <div className="flex gap-2">
      <input
        id={`${idPrefix}-value`}
        type="number"
        min={1}
        inputMode="numeric"
        className={inputClasses}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
      />
      <select
        id={`${idPrefix}-unit`}
        aria-label="Duration unit"
        className={`${inputClasses} max-w-32`}
        value={unit}
        onChange={(e) => onUnitChange(e.target.value as DurationUnit)}
      >
        <option value="days">days</option>
        <option value="months">months</option>
        <option value="years">years</option>
      </select>
    </div>
  );
}

function PartyFields({
  idPrefix,
  title,
  party,
  onChange,
}: {
  idPrefix: string;
  title: string;
  party: PartyInfo;
  onChange: (party: PartyInfo) => void;
}) {
  const set = (field: keyof PartyInfo) => (e: ChangeEvent<HTMLInputElement>) =>
    onChange({ ...party, [field]: e.target.value });

  return (
    <div className="space-y-4">
      <SectionHeading>{title}</SectionHeading>
      <Field label="Legal name" htmlFor={`${idPrefix}-name`}>
        <input
          id={`${idPrefix}-name`}
          className={inputClasses}
          placeholder="Acme, Inc."
          value={party.name}
          onChange={set("name")}
        />
      </Field>
      <Field label="Address" htmlFor={`${idPrefix}-address`}>
        <input
          id={`${idPrefix}-address`}
          className={inputClasses}
          placeholder="123 Market St, San Francisco, CA 94103"
          value={party.address}
          onChange={set("address")}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Signatory name" htmlFor={`${idPrefix}-signatory`}>
          <input
            id={`${idPrefix}-signatory`}
            className={inputClasses}
            placeholder="Jamie Rivera"
            value={party.signatoryName}
            onChange={set("signatoryName")}
          />
        </Field>
        <Field label="Signatory title" htmlFor={`${idPrefix}-title`}>
          <input
            id={`${idPrefix}-title`}
            className={inputClasses}
            placeholder="CEO"
            value={party.signatoryTitle}
            onChange={set("signatoryTitle")}
          />
        </Field>
      </div>
    </div>
  );
}

export default function NdaForm({ data, onChange }: NdaFormProps) {
  return (
    <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
      <PartyFields
        idPrefix="party-a"
        title="Party 1"
        party={data.partyA}
        onChange={(partyA) => onChange({ ...data, partyA })}
      />

      <PartyFields
        idPrefix="party-b"
        title="Party 2"
        party={data.partyB}
        onChange={(partyB) => onChange({ ...data, partyB })}
      />

      <div className="space-y-4">
        <SectionHeading>Agreement terms</SectionHeading>

        <Field
          label="Purpose"
          htmlFor="purpose"
          hint="Completes the clause “…in connection with the ___”, so phrase it as a noun."
        >
          <textarea
            id="purpose"
            rows={2}
            className={inputClasses}
            placeholder="evaluation of a potential business partnership between the parties"
            value={data.purpose}
            onChange={(e) => onChange({ ...data, purpose: e.target.value })}
          />
        </Field>

        <Field label="Effective date" htmlFor="effective-date">
          <input
            id="effective-date"
            type="date"
            className={inputClasses}
            value={data.effectiveDate}
            onChange={(e) =>
              onChange({ ...data, effectiveDate: e.target.value })
            }
          />
        </Field>

        <Field label="MNDA term" htmlFor="mnda-term-value" hint="How long the agreement itself stays active.">
          <DurationInput
            idPrefix="mnda-term"
            value={data.mndaTermValue}
            unit={data.mndaTermUnit}
            onValueChange={(mndaTermValue) => onChange({ ...data, mndaTermValue })}
            onUnitChange={(mndaTermUnit) => onChange({ ...data, mndaTermUnit })}
          />
        </Field>

        <div className="space-y-2">
          <Field
            label="Term of confidentiality"
            htmlFor="confidentiality-term-value"
            hint="How long confidential information stays protected after the MNDA ends."
          >
            <DurationInput
              idPrefix="confidentiality-term"
              value={data.confidentialityTermValue}
              unit={data.confidentialityTermUnit}
              onValueChange={(confidentialityTermValue) =>
                onChange({ ...data, confidentialityTermValue })
              }
              onUnitChange={(confidentialityTermUnit) =>
                onChange({ ...data, confidentialityTermUnit })
              }
            />
          </Field>
          <label className="flex items-center gap-2 text-[0.8rem] text-[rgba(28,31,42,0.85)]">
            <input
              type="checkbox"
              className="rounded border-rule accent-seal"
              checked={data.confidentialityPerpetual}
              onChange={(e) =>
                onChange({ ...data, confidentialityPerpetual: e.target.checked })
              }
            />
            Confidentiality obligations survive in perpetuity
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Governing law" htmlFor="governing-law" hint="A US state">
            <input
              id="governing-law"
              className={inputClasses}
              placeholder="Delaware"
              value={data.governingLaw}
              onChange={(e) =>
                onChange({ ...data, governingLaw: e.target.value })
              }
            />
          </Field>
          <Field label="Jurisdiction" htmlFor="jurisdiction" hint="Where courts sit">
            <input
              id="jurisdiction"
              className={inputClasses}
              placeholder="San Francisco, California"
              value={data.jurisdiction}
              onChange={(e) =>
                onChange({ ...data, jurisdiction: e.target.value })
              }
            />
          </Field>
        </div>
      </div>
    </form>
  );
}
