/**
 * Applying the fields a chat turn settled, for any agreement.
 *
 * Values arrive as strings because every field crosses the wire in one shape.
 * A value that does not fit its field leaves that field alone rather than
 * overwriting it.
 */

import type { DocumentType } from "@/lib/documentType";
import { isDurationUnit, pathsOf, type FormData } from "@/lib/formData";

export interface FieldUpdate {
  field: string;
  value: string;
}

/** Units and booleans are matched by exact string elsewhere, so they are stored canonically. */
function isKeyword(spec: DocumentType, path: string): boolean {
  return path.endsWith(".unit") || spec.fields.some((f) => f.key === path && f.kind === "boolean");
}

function accepts(spec: DocumentType, path: string, value: string): boolean {
  if (path.endsWith(".unit")) return isDurationUnit(value.trim());
  const field = spec.fields.find((entry) => entry.key === path);
  if (field?.kind === "boolean") {
    return ["true", "false"].includes(value.trim().toLowerCase());
  }
  return true;
}

export function applyUpdates(
  spec: DocumentType,
  data: FormData,
  updates: FieldUpdate[],
): FormData {
  const known = new Set(spec.fields.flatMap(pathsOf));
  const next = { ...data };

  for (const { field, value } of updates) {
    if (!known.has(field) || !accepts(spec, field, value)) continue;
    next[field] = isKeyword(spec, field) ? value.trim().toLowerCase() : value;
  }
  return next;
}

/** Turns a field path into something readable, e.g. "Customer legal name". */
export function humanizeField(spec: DocumentType, path: string): string {
  const base = path.replace(/\.(value|unit)$/, "");
  const field = spec.fields.find((entry) => entry.key === base);
  if (field) {
    const section = field.section === field.label ? "" : `${field.section} `;
    return `${section}${field.label.toLowerCase()}`;
  }
  return base;
}
