"use client";

import { useEffect, useRef, useState } from "react";
import { postChat, type ChatMessage } from "@/lib/api";
import { humanizeField, type FieldUpdate } from "@/lib/documentChat";
import type { DocumentType } from "@/lib/documentType";
import type { FormData } from "@/lib/formData";

interface DocumentChatProps {
  spec: DocumentType;
  data: FormData;
  /** The reader already picked this agreement, so there is nothing to choose. */
  chosen: boolean;
  /** Something has been entered, so switching agreement would lose it. */
  dirty: boolean;
  /** Applied against the live form state, not the state this turn was sent with. */
  onApply: (updates: FieldUpdate[], forDocType: string) => void;
  /** The assistant started a different agreement, and may have filled some of it in. */
  onChooseDocument: (docType: string, updates: FieldUpdate[]) => void;
}

interface Turn extends ChatMessage {
  /** Fields this turn filled in, shown under the reply. */
  filled?: string[];
}

const GREETING: Turn = {
  role: "assistant",
  content:
    "Tell me what you need and I will draft it. If you already know, say which " +
    "agreement — otherwise describe the situation and I will suggest one.",
};

/** The opening once the reader has picked an agreement themselves. */
function greetingFor(spec: DocumentType): Turn {
  return {
    role: "assistant",
    content:
      `Let's draft your ${spec.name}. Tell me who the parties are and what it is ` +
      "for, and I will ask for everything else it needs.",
  };
}

export default function DocumentChat({
  spec,
  data,
  chosen,
  dirty,
  onApply,
  onChooseDocument,
}: DocumentChatProps) {
  const [turns, setTurns] = useState<Turn[]>(() => [chosen ? greetingFor(spec) : GREETING]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  /** Set once this conversation has settled on an agreement of its own. */
  const [settled, setSettled] = useState(false);
  /**
   * Until an agreement is settled, the assistant is choosing one, not filling
   * one in. Work already typed into the form settles it too, so asking for
   * another agreement gets the drafting chat's warning before anything is lost.
   */
  const choosing = !chosen && !settled && !dirty;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pane = scrollRef.current;
    if (pane) pane.scrollTop = pane.scrollHeight;
  }, [turns, sending]);

  async function send() {
    const content = input.trim();
    if (!content || sending) return;

    const history: Turn[] = [...turns, { role: "user", content }];
    setTurns(history);
    setInput("");
    setSending(true);
    setFailed(false);

    try {
      const sentFor = choosing ? null : spec.doc_type;
      const answer = await postChat(
        sentFor,
        history.map(({ role, content }) => ({ role, content })),
        data,
      );

      // A reply can answer for a different agreement than the one on screen:
      // either the first one chosen, or one the user confirmed switching to.
      const answeredFor = answer.doc_type ?? sentFor;
      const switching = answeredFor !== null && answeredFor !== spec.doc_type;
      const reply: Turn = {
        role: "assistant",
        content: answer.reply,
        // Labels come from the agreement on screen, which a switch has not replaced yet.
        filled: switching ? [] : answer.updates.map((u) => humanizeField(spec, u.field)),
      };

      // Leaving a draft starts over, so the old conversation goes with the old data.
      setTurns(switching && !choosing ? [reply] : [...history, reply]);

      if (choosing && answer.doc_type) setSettled(true);

      if (switching) onChooseDocument(answeredFor, answer.updates);
      else if (answer.updates.length && answeredFor) onApply(answer.updates, answeredFor);
    } catch {
      setFailed(true);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-[70vh] flex-col overflow-hidden rounded-lg border border-rule bg-paper">
      <div
        ref={scrollRef}
        aria-live="polite"
        aria-label="Conversation"
        className="flex-1 space-y-4 overflow-y-auto p-4"
      >
        {turns.map((turn, index) => (
          <Bubble key={index} turn={turn} />
        ))}
        {sending && (
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate">
            Thinking…
          </p>
        )}
        {failed && (
          <p role="alert" className="text-[0.8rem] text-seal-dark">
            Couldn&apos;t reach the assistant. Try sending that again.
          </p>
        )}
      </div>

      <div className="border-t border-rule p-3">
        <div className="flex items-end gap-2">
          <textarea
            aria-label="Message"
            rows={2}
            className="w-full resize-none rounded-md border border-rule bg-paper px-3 py-2 text-[0.925rem] text-ink placeholder:text-[rgba(91,100,114,0.6)] transition-colors focus:border-seal focus:outline-none focus:ring-2 focus:ring-[rgba(178,58,46,0.4)]"
            placeholder={
              choosing
                ? "We're sharing confidential information with a supplier"
                : "Acme, Inc. and Globex LLC"
            }
            value={input}
            disabled={sending}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
          />
          <button
            type="button"
            onClick={() => void send()}
            disabled={sending || !input.trim()}
            className="rounded-md bg-seal px-4 py-2 text-[0.85rem] font-medium text-paper transition-colors hover:bg-seal-dark disabled:bg-[rgba(91,100,114,0.4)]"
          >
            Send
          </button>
        </div>
        <p className="pt-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-slate">
          {choosing ? "Describe what you need" : "Answers fill the document as you go"}
        </p>
      </div>
    </div>
  );
}

function Bubble({ turn }: { turn: Turn }) {
  const fromUser = turn.role === "user";

  return (
    <div className={fromUser ? "flex justify-end" : "space-y-1.5"}>
      <div
        className={
          fromUser
            ? "max-w-[85%] rounded-md bg-seal px-3 py-2 text-[0.9rem] text-paper"
            : "max-w-[90%] rounded-md bg-[rgba(216,212,200,0.3)] px-3 py-2 font-serif text-[0.95rem] text-ink"
        }
      >
        {turn.content}
      </div>
      {turn.filled && turn.filled.length > 0 && (
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-seal-dark">
          Filled in: {turn.filled.join(", ")}
        </p>
      )}
    </div>
  );
}
