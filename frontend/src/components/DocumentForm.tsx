"use client";

import type { ReactNode } from "react";
import type { FieldSpec, DocumentType } from "@/lib/documentType";
import { DURATION_UNITS, type FormData } from "@/lib/formData";

interface DocumentFormProps {
  spec: DocumentType;
  data: FormData;
  onChange: (data: FormData) => void;
}

const inputClasses =
  "w-full rounded-md border border-rule bg-paper px-3 py-2 text-[0.925rem] text-ink placeholder:text-[rgba(91,100,114,0.6)] focus:outline-none focus:ring-2 focus:ring-[rgba(178,58,46,0.4)] focus:border-seal transition-colors";

function idFor(key: string): string {
  return `field-${key.replace(/\./g, "-")}`;
}

function Label({
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
  field,
  data,
  set,
}: {
  field: FieldSpec;
  data: FormData;
  set: (path: string, value: string) => void;
}) {
  return (
    <div className="flex gap-2">
      <input
        id={idFor(field.key)}
        type="number"
        min={1}
        inputMode="numeric"
        className={inputClasses}
        value={data[`${field.key}.value`] ?? ""}
        onChange={(e) => set(`${field.key}.value`, e.target.value)}
      />
      <select
        aria-label={`${field.label} unit`}
        className={`${inputClasses} max-w-32`}
        value={data[`${field.key}.unit`] ?? "years"}
        onChange={(e) => set(`${field.key}.unit`, e.target.value)}
      >
        {DURATION_UNITS.map((unit) => (
          <option key={unit} value={unit}>
            {unit}
          </option>
        ))}
      </select>
    </div>
  );
}

function Control({
  field,
  data,
  set,
}: {
  field: FieldSpec;
  data: FormData;
  set: (path: string, value: string) => void;
}) {
  const id = idFor(field.key);
  const value = data[field.key] ?? "";

  switch (field.kind) {
    case "duration":
      return <DurationInput field={field} data={data} set={set} />;
    case "textarea":
      return (
        <textarea
          id={id}
          rows={2}
          className={inputClasses}
          value={value}
          onChange={(e) => set(field.key, e.target.value)}
        />
      );
    case "date":
      return (
        <input
          id={id}
          type="date"
          className={inputClasses}
          value={value}
          onChange={(e) => set(field.key, e.target.value)}
        />
      );
    case "choice":
      return (
        <select
          id={id}
          className={inputClasses}
          value={value}
          onChange={(e) => set(field.key, e.target.value)}
        >
          <option value="">Choose…</option>
          {field.choices.map((choice) => (
            <option key={choice} value={choice}>
              {choice}
            </option>
          ))}
        </select>
      );
    default:
      return (
        <input
          id={id}
          className={inputClasses}
          value={value}
          onChange={(e) => set(field.key, e.target.value)}
        />
      );
  }
}

export default function DocumentForm({ spec, data, onChange }: DocumentFormProps) {
  const set = (path: string, value: string) => onChange({ ...data, [path]: value });

  return (
    <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
      {spec.sections.map((section) => (
        <div key={section} className="space-y-4">
          <SectionHeading>{section}</SectionHeading>
          {spec.fields
            .filter((field) => field.section === section)
            .map((field) =>
              field.kind === "boolean" ? (
                <label
                  key={field.key}
                  className="flex items-center gap-2 text-[0.8rem] text-[rgba(28,31,42,0.85)]"
                >
                  <input
                    type="checkbox"
                    className="rounded border-rule accent-seal"
                    checked={(data[field.key] ?? "") === "true"}
                    onChange={(e) => set(field.key, e.target.checked ? "true" : "false")}
                  />
                  {field.label}
                </label>
              ) : (
                <Label
                  key={field.key}
                  label={field.label}
                  htmlFor={idFor(field.key)}
                  hint={field.optional ? "Optional" : undefined}
                >
                  <Control field={field} data={data} set={set} />
                </Label>
              ),
            )}
        </div>
      ))}
    </form>
  );
}
