import { csvCell as cell } from "@/lib/csv";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const inquiries = await prisma.inquiry.findMany({ orderBy: { createdAt: "desc" } });

  const columns = [
    "name", "email", "phone", "company", "projectType", "budget",
    "preferredDate", "location", "status", "referral", "website",
    "message", "ipAddress", "createdAt",
  ] as const;

  const lines = [columns.join(",")];
  for (const i of inquiries) {
    lines.push(columns.map((c) => cell(i[c])).join(","));
  }
  const csv = "﻿" + lines.join("\r\n");

  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="inquiries-${date}.csv"`,
    },
  });
}
