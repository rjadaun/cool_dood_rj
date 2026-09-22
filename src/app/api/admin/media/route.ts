import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { uploadFile, UploadError } from "@/lib/media/upload";
import { logActivity } from "@/lib/activity";

export const runtime = "nodejs";

/** List media (paginated, searchable). */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const perPage = 24;

  const where = q
    ? { OR: [{ filename: { contains: q, mode: "insensitive" as const } }, { altText: { contains: q, mode: "insensitive" as const } }] }
    : {};

  const [items, total] = await Promise.all([
    prisma.media.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * perPage, take: perPage }),
    prisma.media.count({ where }),
  ]);

  return NextResponse.json({ items, total, totalPages: Math.max(1, Math.ceil(total / perPage)), page });
}

/** Upload one or more files. */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const files = formData.getAll("files").filter((f): f is File => f instanceof File);
    const folder = String(formData.get("folder") ?? "uploads");

    if (files.length === 0) return NextResponse.json({ error: "No files provided" }, { status: 400 });

    const created = [];
    for (const file of files) {
      const media = await uploadFile(file, { folder, uploadedById: session.user.id });
      created.push(media);
    }

    await logActivity({
      userId: session.user.id,
      action: "upload",
      entity: "Media",
      summary: `Uploaded ${created.length} file(s)`,
    });

    return NextResponse.json({ items: created });
  } catch (err) {
    if (err instanceof UploadError) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error("[media upload]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
