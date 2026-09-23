"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createDocument,
  fetchDocument,
  fetchDocumentType,
  updateDocument,
  type DocumentInput,
} from "@/lib/api";
import { applyUpdates as merge, type FieldUpdate } from "@/lib/documentChat";
import type { DocumentType } from "@/lib/documentType";
import { emptyData, hasProgress, type FormData } from "@/lib/formData";

export type DraftStatus = "idle" | "saving" | "saved" | "error";

export const FIRST_DOC_TYPE = "Mutual-NDA.md";

function draftTitle(spec: DocumentType, data: FormData): string {
  const parties = spec.fields
    .filter((field) => field.key.endsWith(".name") && field.shared.startsWith("party"))
    .map((field) => data[field.key])
    .filter(Boolean);
  return parties.length ? `${parties.join(" / ")} ${spec.name}` : `Untitled ${spec.name}`;
}

/**
 * Holds the agreement being drafted and persists it through the API.
 *
 * A draft opened with `?id=<document id>` is loaded on mount, along with the
 * document type it was saved as; saving an unsaved draft creates it and puts
 * its id in the URL so the link can be reopened later.
 */
export function useDraft() {
  const [spec, setSpec] = useState<DocumentType | null>(null);
  const [data, setData] = useState<FormData>({});
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [status, setStatus] = useState<DraftStatus>("idle");
  /** Whether the reader chose this agreement, as opposed to landing on the default. */
  const [chosen, setChosen] = useState(false);
  /** Read by applyUpdates, which can be called by a reply that predates a switch. */
  const live = useRef<DocumentType | null>(null);

  useEffect(() => {
    live.current = spec;
  }, [spec]);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id");

    if (!id) {
      fetchDocumentType(FIRST_DOC_TYPE)
        .then((first) => {
          setSpec(first);
          setData(emptyData(first));
        })
        .catch(() => setStatus("error"));
      return;
    }

    fetchDocument<FormData>(id)
      .then(async (saved) => {
        const type = await fetchDocumentType(saved.doc_type);
        setSpec(type);
        setData({ ...emptyData(type), ...saved.data });
        setDocumentId(saved.id);
        setChosen(true);
        setStatus("saved");
      })
      .catch(() => setStatus("error"));
  }, []);

  const save = useCallback(async () => {
    if (!spec) return;
    setStatus("saving");
    const input: DocumentInput<FormData> = {
      doc_type: spec.doc_type,
      title: draftTitle(spec, data),
      data,
    };

    try {
      const saved = documentId
        ? await updateDocument(documentId, input)
        : await createDocument(input);
      setDocumentId(saved.id);
      window.history.replaceState(null, "", `?id=${saved.id}`);
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }, [spec, data, documentId]);

  const update = useCallback((next: FormData) => {
    setData(next);
    setStatus("idle");
  }, []);

  /**
   * Merges assistant updates into whatever the form holds now.
   *
   * A reply can land after the user has edited the form, so this reads the
   * current state rather than the state the request was sent with. A reply for
   * an agreement they have since left is dropped: two documents can name a
   * field alike and mean different things by it.
   */
  const applyUpdates = useCallback((updates: FieldUpdate[], forDocType: string) => {
    const current = live.current;
    if (!current || current.doc_type !== forDocType) return;
    setData((data) => merge(current, data, updates));
    setStatus("idle");
  }, []);

  /** Whether switching agreement would throw away anything entered so far. */
  const dirty = spec ? hasProgress(spec, data) : false;

  /**
   * Starts `docType` from a blank form, as a fresh unsaved draft.
   *
   * Nothing carries over from the agreement being left. `updates` are fields
   * the chat settled for the new agreement in the same turn that chose it.
   */
  const startOver = useCallback(async (docType: string, updates: FieldUpdate[] = []) => {
    const next = await fetchDocumentType(docType);
    setData(merge(next, emptyData(next), updates));
    setSpec(next);
    setChosen(true);
    setDocumentId(null);
    setStatus("idle");
    window.history.replaceState(null, "", window.location.pathname);
  }, []);

  return { spec, data, chosen, dirty, update, applyUpdates, save, status, startOver };
}
