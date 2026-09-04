/**
 * The shape of an agreement, as the backend describes it.
 *
 * Nothing here is written per document: the fields and the clauses both come
 * from `GET /api/document-types/{docType}`, so adding an agreement to the
 * catalog needs no change on this side.
 */

export type FieldKind =
  | "text"
  | "textarea"
  | "date"
  | "duration"
  | "currency"
  | "choice"
  | "boolean";

export interface FieldSpec {
  key: string;
  label: string;
  kind: FieldKind;
  section: string;
  /** Defined-term text shown in the document while the field is empty. */
  placeholder: string;
  choices: string[];
  /** For a duration, "2 years". */
  default: string;
  /** Canonical name, so a value can survive a change of document type. */
  shared: string;
  /** False for a term whose words stay in the prose and whose value sits on the cover page. */
  inline: boolean;
  optional: boolean;
  /** Not required while the named field holds the given value. */
  required_unless: [string, string] | null;
}

export interface Clause {
  number: string;
  title: string;
  body: string;
  children: Clause[];
}

export interface DocumentType {
  doc_type: string;
  name: string;
  intro: string;
  attribution: string;
  sections: string[];
  fields: FieldSpec[];
  clauses: Clause[];
}
