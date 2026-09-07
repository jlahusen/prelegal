/**
 * The values the parsed clauses interpolate.
 *
 * A clause carries `{{key}}` for a value, and `{{key__poss}}` or `{{key__pl}}`
 * where the template had a possessive or plural of a party's role word, so
 * "Customer's obligations" reads as "Acme, Inc.'s obligations" once the name
 * is known.
 */

import type { DocumentType } from "@/lib/documentType";
import { displayValue, type FormData } from "@/lib/formData";
import type { FillValue } from "@/lib/renderRichText";

function possessive(name: string): string {
  return name.endsWith("s") ? `${name}’` : `${name}’s`;
}

export function buildFillValues(
  spec: DocumentType,
  data: FormData,
): Record<string, FillValue> {
  const values: Record<string, FillValue> = {};

  for (const field of spec.fields) {
    const value = displayValue(field, data);
    const placeholder = field.placeholder || field.label;
    values[field.key] = { value, placeholder };
    values[`${field.key}__poss`] = {
      value: value ? possessive(value) : "",
      placeholder: possessive(placeholder),
    };
    values[`${field.key}__pl`] = {
      value: value ? `${value}s` : "",
      placeholder: `${placeholder}s`,
    };
  }
  return values;
}
