import { parseDocument } from "htmlparser2";
import { textContent } from "domutils";

export function htmlToText(html: string) {
  try {
    const doc = parseDocument(html);
    // collapse whitespace a bit
    return textContent(doc)
      .replace(/\u00A0/g, " ")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  } catch {
    return html.replace(/<[^>]+>/g, " "); // super-fallback
  }
}
