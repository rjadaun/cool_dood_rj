import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { uploadFile, UploadError } from "@/lib/media/upload";
import { mediaPage } from "@/lib/media/shared";
import { logActivity } from "@/lib/activity";

export const runtime = "nodejs";
export const maxDuration = 60;

/** List media (paginated, searchable). */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const requestedPage = mediaPage(searchParams.get("page"));
  const perPage = 24;

  const where = q
    ? { OR: [{ filename: { contains: q, mode: "insensitive" as const } }, { altText: { contains: q, mode: "insensitive" as const } }] }
    : {};

  try {
    const total = await prisma.media.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const page = Math.min(requestedPage, totalPages);
    const items = await prisma.media.findMany({ where, orderBy: [{ createdAt: "desc" }, { id: "desc" }], skip: (page - 1) * perPage, take: perPage });
    return NextResponse.json({ items, total, totalPages, page }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[media list]", err);
    return NextResponse.json({ error: "Could not load the media library. Please try again." }, { status: 500 });
  }
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

    if (files.length > 1) return NextResponse.json({ error: "Upload one image per request. Refresh the admin panel to use the latest uploader." }, { status: 400 });
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
