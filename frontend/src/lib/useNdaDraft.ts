"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createDocument,
  fetchDocument,
  updateDocument,
  type DocumentInput,
} from "@/lib/api";
import { applyNdaUpdates, type NdaFieldUpdate } from "@/lib/ndaChat";
import { emptyNdaFormData, type NdaFormData } from "@/lib/types";

export type DraftStatus = "idle" | "saving" | "saved" | "error";

const DOC_TYPE = "Mutual-NDA.md";

function draftTitle(data: NdaFormData): string {
  const parties = [data.partyA.name, data.partyB.name].filter(Boolean);
  return parties.length ? `${parties.join(" / ")} Mutual NDA` : "Untitled Mutual NDA";
}

/**
 * Holds the NDA form data and persists it through the API.
 *
 * A draft opened with `?id=<document id>` is loaded on mount; saving an
 * unsaved draft creates it and puts its id in the URL so the link can be
 * reopened later.
 */
export function useNdaDraft() {
  const [data, setData] = useState<NdaFormData>(emptyNdaFormData);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [status, setStatus] = useState<DraftStatus>("idle");

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id");
    if (!id) return;

    fetchDocument<NdaFormData>(id)
      .then((document) => {
        setData(document.data);
        setDocumentId(document.id);
        setStatus("saved");
      })
      .catch(() => setStatus("error"));
  }, []);

  const save = useCallback(async () => {
    setStatus("saving");
    const input: DocumentInput<NdaFormData> = {
      doc_type: DOC_TYPE,
      title: draftTitle(data),
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
  }, [data, documentId]);

  const update = useCallback((next: NdaFormData) => {
    setData(next);
    setStatus("idle");
  }, []);

  /**
   * Merges assistant updates into whatever the form holds now.
   *
   * A reply can land after the user has edited the form, so this reads the
   * current state rather than the state the request was sent with.
   */
  const applyUpdates = useCallback((updates: NdaFieldUpdate[]) => {
    setData((current) => applyNdaUpdates(current, updates));
    setStatus("idle");
  }, []);

  return { data, update, applyUpdates, save, status };
}
