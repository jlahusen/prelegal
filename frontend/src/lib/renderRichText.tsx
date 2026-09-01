import { Fragment, type ReactNode } from "react";

export interface FillValue {
  /** The user-entered value, e.g. "Delaware". Replaces the placeholder once given. */
  value: string;
  /** Defined-term text shown while the field is empty, e.g. "the Effective Date". */
  placeholder: string;
}

const TOKEN_PATTERN = /(\*\*[^*]+\*\*|\{\{\w+\}\})/g;

/**
 * Renders **bold** markdown spans and {{token}} cover-page placeholders from
 * the Standard Terms into React nodes. An unfilled token reads as its defined
 * term ("commences on the Effective Date"), and a filled one substitutes the
 * value in its place ("commences on September 1, 2026") — so the clause is
 * grammatical either way, with no duplicated article.
 */
export function renderRichText(
  text: string,
  values: Record<string, FillValue>,
): ReactNode {
  const parts = text.split(TOKEN_PATTERN);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }

    const tokenMatch = /^\{\{(\w+)\}\}$/.exec(part);
    if (tokenMatch) {
      const fill = values[tokenMatch[1]];
      if (!fill) return null;
      const isEmpty = !fill.value;
      return (
        <span key={i} className="doc-fill" data-empty={isEmpty}>
          {isEmpty ? fill.placeholder : fill.value}
        </span>
      );
    }

    return <Fragment key={i}>{part}</Fragment>;
  });
}
