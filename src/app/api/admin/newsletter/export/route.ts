import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/** Escape a single CSV cell (RFC 4180 style). */
function cell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = value instanceof Date ? value.toISOString() : String(value);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET() {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const subscribers = await prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" } });

  const columns = ["email", "active", "source", "createdAt"] as const;

  const lines = [columns.join(",")];
  for (const s of subscribers) {
    lines.push(columns.map((c) => cell(s[c])).join(","));
  }
  const csv = "﻿" + lines.join("\r\n");

  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="newsletter-${date}.csv"`,
    },
  });
}
