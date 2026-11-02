import cleanHtml from "sanitize-html";

const safeUrl = /^(?:(?:https?|mailto|tel):|\/(?!\/)|#)/i;

/** Server-side HTML sanitizing without jsdom or a browser DOM dependency. */
export function sanitizeHtml(dirty: string): string {
  return cleanHtml(dirty, {
    allowedTags: [
      "p", "br", "strong", "em", "u", "s", "blockquote", "h2", "h3", "h4",
      "ul", "ol", "li", "a", "hr", "figure", "figcaption", "img",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["http", "https"] },
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attribs) => {
        if (attribs.href && !safeUrl.test(attribs.href.trim())) delete attribs.href;
        if (attribs.target === "_blank") attribs.rel = "noopener noreferrer";
        return { tagName, attribs };
      },
      img: (tagName, attribs) => {
        if (attribs.src && !safeUrl.test(attribs.src.trim())) delete attribs.src;
        return { tagName, attribs };
      },
    },
  });
}
