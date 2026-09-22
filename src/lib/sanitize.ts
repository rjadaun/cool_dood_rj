import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitises rich-text HTML before it is stored or rendered.
 * Allows a safe editorial subset (headings, emphasis, lists, links, quotes).
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      "p", "br", "strong", "em", "u", "s", "blockquote", "h2", "h3", "h4",
      "ul", "ol", "li", "a", "hr", "figure", "figcaption", "img",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "src", "alt"],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|\/|#)/i,
  });
}
