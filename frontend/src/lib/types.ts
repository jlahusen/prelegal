export type DurationUnit = "days" | "months" | "years";

export interface PartyInfo {
  name: string;
  address: string;
  signatoryName: string;
  signatoryTitle: string;
}

export interface NdaFormData {
  partyA: PartyInfo;
  partyB: PartyInfo;
  purpose: string;
  effectiveDate: string;
  mndaTermValue: string;
  mndaTermUnit: DurationUnit;
  confidentialityPerpetual: boolean;
  confidentialityTermValue: string;
  confidentialityTermUnit: DurationUnit;
  governingLaw: string;
  jurisdiction: string;
}

export const emptyParty: PartyInfo = {
  name: "",
  address: "",
  signatoryName: "",
  signatoryTitle: "",
};

export const emptyNdaFormData: NdaFormData = {
  partyA: { ...emptyParty },
  partyB: { ...emptyParty },
  purpose: "",
  effectiveDate: "",
  mndaTermValue: "2",
  mndaTermUnit: "years",
  confidentialityPerpetual: false,
  confidentialityTermValue: "3",
  confidentialityTermUnit: "years",
  governingLaw: "",
  jurisdiction: "",
};

const REQUIRED_PARTY_FIELDS: (keyof PartyInfo)[] = [
  "name",
  "address",
  "signatoryName",
  "signatoryTitle",
];

export function isPartyComplete(party: PartyInfo): boolean {
  return REQUIRED_PARTY_FIELDS.every((field) => party[field].trim().length > 0);
}

/** A duration has to be a real, positive number — "0" and "-3" are not terms. */
export function isValidDuration(value: string): boolean {
  const parsed = Number(value.trim());
  return value.trim().length > 0 && Number.isFinite(parsed) && parsed >= 1;
}

export function isNdaComplete(data: NdaFormData): boolean {
  const baseFieldsFilled =
    isPartyComplete(data.partyA) &&
    isPartyComplete(data.partyB) &&
    data.purpose.trim().length > 0 &&
    data.effectiveDate.trim().length > 0 &&
    isValidDuration(data.mndaTermValue) &&
    data.governingLaw.trim().length > 0 &&
    data.jurisdiction.trim().length > 0;

  const confidentialityFilled =
    data.confidentialityPerpetual ||
    isValidDuration(data.confidentialityTermValue);

  return baseFieldsFilled && confidentialityFilled;
}

export function formatDuration(value: string, unit: DurationUnit): string {
  if (!value.trim()) return "";
  const n = Number(value);
  const label = n === 1 ? unit.slice(0, -1) : unit;
  return `${value} ${label}`;
}

export function formatDate(isoDate: string): string {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return isoDate;
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
