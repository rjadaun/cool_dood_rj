export const ENQUIRY_LABEL = "Enquire about a shoot";

/** Keep custom destinations intact; give every local enquiry action one name. */
export function enquiryLabel(href: string, label?: string | null) {
  return /^\/contact\/?(?:[?#].*)?$/.test(href)
    ? ENQUIRY_LABEL
    : label || ENQUIRY_LABEL;
}
