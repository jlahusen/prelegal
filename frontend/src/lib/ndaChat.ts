import { PARTY_FIELDS } from "@/lib/types";
import type { DurationUnit, NdaFormData, PartyInfo } from "@/lib/types";

type PartyKey = "partyA" | "partyB";
type FlatField = Exclude<keyof NdaFormData, PartyKey>;
type PartyField = `${PartyKey}.${keyof PartyInfo}`;

/** Every field the assistant is allowed to set, as a dotted path. */
export type NdaFieldPath = FlatField | PartyField;

export interface NdaFieldUpdate {
  field: NdaFieldPath;
  value: string;
}

const DURATION_UNITS: DurationUnit[] = ["days", "months", "years"];

/**
 * Applies the fields an assistant turn settled, leaving every other field alone.
 *
 * Values arrive as strings because the agreement's fields cross the wire in one
 * shape, so the two non-string fields are converted back here. A value that
 * doesn't convert leaves its field untouched rather than overwriting it.
 */
export function applyNdaUpdates(
  data: NdaFormData,
  updates: NdaFieldUpdate[],
): NdaFormData {
  return updates.reduce(applyOne, data);
}

function applyOne(data: NdaFormData, { field, value }: NdaFieldUpdate): NdaFormData {
  if (field.startsWith("partyA.") || field.startsWith("partyB.")) {
    const [party, key] = field.split(".") as [PartyKey, keyof PartyInfo];
    if (!PARTY_FIELDS.includes(key)) return data;
    return { ...data, [party]: { ...data[party], [key]: value } };
  }

  if (field === "confidentialityPerpetual") {
    const flag = value.trim().toLowerCase();
    if (flag !== "true" && flag !== "false") return data;
    return { ...data, confidentialityPerpetual: flag === "true" };
  }

  if (field === "mndaTermUnit" || field === "confidentialityTermUnit") {
    const unit = value as DurationUnit;
    return DURATION_UNITS.includes(unit) ? { ...data, [field]: unit } : data;
  }

  // The server restricts `field` to the agreement's own fields; this guards the
  // boundary anyway, since the response is untyped until it lands here.
  return field in data ? { ...data, [field]: value } : data;
}

/** Turns a field path into something readable, e.g. "Party 1 signatory name". */
export function humanizeField(field: NdaFieldPath): string {
  const [head, tail] = field.split(".");
  const party = head === "partyA" ? "Party 1" : head === "partyB" ? "Party 2" : "";
  const words = (tail ?? head)
    .replace(/([A-Z])/g, " $1")
    .toLowerCase()
    .trim();
  return party ? `${party} ${words}` : words.charAt(0).toUpperCase() + words.slice(1);
}
