import { env } from "@/lib/env";

export interface EmailMessage {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

interface EmailProvider {
  send(message: EmailMessage): Promise<void>;
}

/** Development provider: logs the email to the server console. */
class LogEmailProvider implements EmailProvider {
  async send(message: EmailMessage): Promise<void> {
    console.info("\n📧 [email:log] ------------------------------");
    console.info(`To:      ${Array.isArray(message.to) ? message.to.join(", ") : message.to}`);
    console.info(`Subject: ${message.subject}`);
    if (message.replyTo) console.info(`Reply-To: ${message.replyTo}`);
    console.info(message.text ?? message.html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
    console.info("-------------------------------------------\n");
  }
}

/** Production provider using Resend's HTTP API (no SDK dependency). */
class ResendEmailProvider implements EmailProvider {
  async send(message: EmailMessage): Promise<void> {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.email.resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.email.from,
        to: Array.isArray(message.to) ? message.to : [message.to],
        subject: message.subject,
        html: message.html,
        text: message.text,
        reply_to: message.replyTo,
      }),
    });
    if (!res.ok) {
      throw new Error(`Resend failed: ${res.status} ${await res.text()}`);
    }
  }
}

function getProvider(): EmailProvider {
  if (env.email.provider === "resend" && env.email.resendKey) {
    return new ResendEmailProvider();
  }
  return new LogEmailProvider();
}

export async function sendEmail(message: EmailMessage): Promise<void> {
  try {
    await getProvider().send(message);
  } catch (err) {
    // Email delivery must never break the primary request flow.
    console.error("[email] send failed:", err);
  }
}
