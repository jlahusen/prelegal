"""Reads a Common Paper template into numbered clauses with {{token}} markers.

The templates are prose only: every fill-in point is an inline
`<span class="coverpage_link">Purpose</span>` naming the value that belongs
there. This turns each of those into a token the preview interpolates, using
the document's spec to decide which field the span belongs to.

Numbering comes from the list markers, not from the `id` attributes -- only
five of the eleven templates carry ids, and the Mutual NDA has no header
spans at all.
"""

import re
from dataclasses import dataclass

from app.documents.spec import DocumentSpec

LIST_ITEM = re.compile(r"^( *)(\d+|[ivx]+|[a-z])\.[ \t]+(.*)$")
HEADER_SPAN = re.compile(r'^<span class="header_\d"(?: id="[^"]*")?>(.*?)</span>\s*(.*)$')
BOLD_TITLE = re.compile(r"^\*\*(.+?)\*\*\.\s*(.*)$")
LINK_SPAN = re.compile(r'(?:\b(the|a|an) )?<span class="\w+_link">(.*?)</span>')
SUFFIX = {"base": "", "possessive": "__poss", "plural": "__pl"}
INDENT = 4


@dataclass(frozen=True)
class Clause:
    number: str
    title: str
    body: str
    children: tuple["Clause", ...] = ()


@dataclass(frozen=True)
class ParsedTemplate:
    doc_type: str
    title: str
    clauses: tuple[Clause, ...]


def _split_heading(content: str) -> tuple[str, str]:
    """A clause's title and the prose after it, in either template style."""
    header = HEADER_SPAN.match(content)
    if header:
        return header.group(1).rstrip("."), header.group(2)
    bold = BOLD_TITLE.match(content)
    if bold:
        return bold.group(1), bold.group(2)
    return "", content


def _tokenise(body: str, spec: DocumentSpec, counts: dict[str, int]) -> str:
    """Replace each fill-in span with its token, or with an override's words.

    A field that absorbs its article drops the "the" in front of it: the
    article belongs with the defined term shown while the field is empty, so
    "commences on the Effective Date" becomes "commences on 1 September 2026".
    """

    def replace(match: re.Match[str]) -> str:
        article, text = match.group(1), match.group(2)
        lead = f"{article} " if article else ""
        counts[text] = counts.get(text, 0) + 1
        literal = spec.override_for(text, counts[text])
        if literal is not None:
            return f"{lead}{literal}"
        entry, form = spec.field_for(text)
        if not entry.inline:
            return f"{lead}{text}"
        if entry.absorbs_article:
            lead = ""
        return lead + "{{" + entry.key + SUFFIX[form] + "}}"

    return LINK_SPAN.sub(replace, body)


class _Node:
    def __init__(self, number: str, title: str, body: str) -> None:
        self.number = number
        self.title = title
        self.body = body
        self.children: list[_Node] = []

    def freeze(self) -> Clause:
        return Clause(self.number, self.title, self.body, tuple(c.freeze() for c in self.children))


def parse_template(raw: str, spec: DocumentSpec) -> ParsedTemplate:
    """Parse one template. Raises KeyError if the spec does not cover a span."""
    title = ""
    roots: list[_Node] = []
    stack: list[_Node] = []
    counts: dict[str, int] = {}

    for line in raw.splitlines():
        if not line.strip():
            continue
        if line.startswith("# "):
            title = line[2:].strip()
            continue

        item = LIST_ITEM.match(line)
        if item is None:
            # An indented line continues the clause above it; an unindented one
            # is the template's closing attribution, which the spec supplies.
            if stack and line.startswith(" "):
                extra = _tokenise(line.strip(), spec, counts)
                stack[-1].body = f"{stack[-1].body} {extra}".strip()
            continue

        indent, marker, content = item.groups()
        depth = len(indent) // INDENT
        heading, body = _split_heading(content)
        del stack[depth:]
        number = f"{stack[-1].number}.{marker}" if stack else marker
        node = _Node(number, heading, _tokenise(body, spec, counts))
        (stack[-1].children if stack else roots).append(node)
        stack.append(node)

    return ParsedTemplate(spec.doc_type, title, tuple(node.freeze() for node in roots))
