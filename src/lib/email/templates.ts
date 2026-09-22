import type { Inquiry } from "@prisma/client";

const shell = (title: string, body: string) => `
  <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#1a1a1d">
    <div style="font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:#a8846b">Rjadaun</div>
    <h1 style="font-size:22px;margin:12px 0 20px;font-weight:600">${title}</h1>
    ${body}
    <hr style="border:none;border-top:1px solid #e9e7e2;margin:28px 0" />
    <p style="font-size:12px;color:#928b7e">This is an automated message from Rjadaun.</p>
  </div>
`;

export function adminInquiryEmail(inquiry: Inquiry) {
  const row = (label: string, value?: string | null) =>
    value ? `<tr><td style="padding:4px 12px 4px 0;color:#928b7e;font-size:13px">${label}</td><td style="padding:4px 0;font-size:13px">${value}</td></tr>` : "";
  return {
    subject: `New inquiry from ${inquiry.name}`,
    html: shell(
      "New project inquiry",
      `<table style="border-collapse:collapse">
        ${row("Name", inquiry.name)}
        ${row("Email", inquiry.email)}
        ${row("Phone", inquiry.phone)}
        ${row("Company", inquiry.company)}
        ${row("Project", inquiry.projectType)}
        ${row("Budget", inquiry.budget)}
        ${row("Location", inquiry.location)}
      </table>
      <p style="margin-top:16px;font-size:14px;line-height:1.6;white-space:pre-wrap">${inquiry.message}</p>`
    ),
  };
}

export function clientInquiryConfirmation(inquiry: Inquiry) {
  return {
    subject: "We received your inquiry",
    html: shell(
      `Thank you, ${inquiry.name.split(" ")[0]}`,
      `<p style="font-size:14px;line-height:1.7">
        Your message has reached the studio. We read every inquiry personally and
        will respond within two business days to discuss your project.
      </p>`
    ),
  };
}
