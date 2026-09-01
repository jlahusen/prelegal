import { Fragment, type ReactNode } from "react";

export interface FillValue {
  /** The defined-term name, e.g. "the Purpose" — always shown. */
  label: string;
  /** The user-entered value, e.g. "evaluating a partnership" — shown in parens once filled. */
  value: string;
}

const TOKEN_PATTERN = /(\*\*[^*]+\*\*|\{\{\w+\}\})/g;

/**
 * Renders **bold** markdown spans and {{token}} cover-page placeholders
 * from the Standard Terms into React nodes. Each token always shows its
 * defined-term label (so the document reads as a real NDA even blank),
 * and appends the user's entered value, once given, styled like a typed
 * entry on a paper form.
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
      return (
        <Fragment key={i}>
          {fill.label}
          {fill.value && (
            <>
              {" ("}
              <span className="doc-fill" data-empty="false">
                {fill.value}
              </span>
              {")"}
            </>
          )}
        </Fragment>
      );
    }

    return <Fragment key={i}>{part}</Fragment>;
  });
}
