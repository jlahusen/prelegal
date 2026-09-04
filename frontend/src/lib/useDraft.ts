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
import { carryOver, emptyData, lostBySwitching, type FormData } from "@/lib/formData";

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

  /** What a switch to `docType` would discard, so the reader can be asked first. */
  const wouldLose = useCallback(
    async (docType: string) => {
      if (!spec) return [];
      return lostBySwitching(spec, data, await fetchDocumentType(docType));
    },
    [spec, data],
  );

  /** Moves to another agreement, keeping the values the two have in common. */
  const switchTo = useCallback(
    async (docType: string) => {
      if (!spec || docType === spec.doc_type) return;
      const next = await fetchDocumentType(docType);
      setData((current) => carryOver(spec, current, next));
      setSpec(next);
      // The saved draft is that other agreement; this one starts unsaved.
      setDocumentId(null);
      setStatus("idle");
      window.history.replaceState(null, "", window.location.pathname);
    },
    [spec],
  );

  return { spec, data, update, applyUpdates, save, status, switchTo, wouldLose };
}
