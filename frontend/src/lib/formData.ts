/**
 * The values someone has entered, for whichever agreement they are drafting.
 *
 * One flat bag keyed by the same dotted paths the backend uses, so nothing has
 * to know the shape of any particular document. A duration keeps its number
 * and its unit under `key.value` and `key.unit`; a checkbox keeps "true".
 */

import type { DocumentType, FieldSpec } from "@/lib/documentType";

export type FormData = Record<string, string>;

export const DURATION_UNITS = ["days", "months", "years"] as const;

export type DurationUnit = (typeof DURATION_UNITS)[number];

export function isDurationUnit(value: string): value is DurationUnit {
  return (DURATION_UNITS as readonly string[]).includes(value);
}

/** The paths a field occupies: a duration takes two, everything else one. */
export function pathsOf(field: FieldSpec): string[] {
  return field.kind === "duration"
    ? [`${field.key}.value`, `${field.key}.unit`]
    : [field.key];
}

export function emptyData(spec: DocumentType): FormData {
  const data: FormData = {};
  for (const field of spec.fields) {
    if (field.kind === "duration") {
      const [value, unit] = field.default.split(" ");
      data[`${field.key}.value`] = value ?? "";
      data[`${field.key}.unit`] = unit ?? "years";
    } else {
      data[field.key] = field.default;
    }
  }
  return data;
}

function isFilled(field: FieldSpec, data: FormData): boolean {
  if (field.kind === "boolean") return true;
  if (field.kind === "duration") {
    const value = Number((data[`${field.key}.value`] ?? "").trim());
    return Number.isFinite(value) && value >= 1;
  }
  return (data[field.key] ?? "").trim().length > 0;
}

function isRequired(field: FieldSpec, data: FormData): boolean {
  if (field.optional) return false;
  if (!field.required_unless) return true;
  const [key, value] = field.required_unless;
  return (data[key] ?? "") !== value;
}

/** Whether the agreement has everything it needs to be signed. */
export function isComplete(spec: DocumentType, data: FormData): boolean {
  return spec.fields.every((field) => !isRequired(field, data) || isFilled(field, data));
}

export function formatDuration(value: string, unit: string): string {
  if (!value.trim()) return "";
  const label = Number(value) === 1 ? unit.replace(/s$/, "") : unit;
  return `${value} ${label}`;
}

export function formatDate(isoDate: string): string {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return isoDate;
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** How a field's value should read inside the document and on the cover page. */
export function displayValue(field: FieldSpec, data: FormData): string {
  switch (field.kind) {
    case "duration":
      return formatDuration(
        data[`${field.key}.value`] ?? "",
        data[`${field.key}.unit`] ?? "years",
      );
    case "date":
      return formatDate(data[field.key] ?? "");
    case "boolean":
      return (data[field.key] ?? "") === "true" ? "Yes" : "No";
    default:
      return (data[field.key] ?? "").trim();
  }
}

/** Whether anything differs from a fresh form, so switching away would lose work. */
export function hasProgress(spec: DocumentType, data: FormData): boolean {
  const fresh = emptyData(spec);
  return Object.keys(fresh).some((path) => (data[path] ?? "") !== fresh[path]);
}
