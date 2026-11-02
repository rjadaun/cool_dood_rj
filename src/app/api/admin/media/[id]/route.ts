import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { deleteMedia, MediaInUseError } from "@/lib/media/upload";
import { revalidateTag } from "next/cache";
import { TAGS } from "@/lib/cache-tags";
import { z } from "zod";
import { logActivity } from "@/lib/activity";

export const runtime = "nodejs";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!/^[a-f0-9]{24}$/i.test(id)) return NextResponse.json({ error: "Invalid media ID." }, { status: 400 });
  const parsed = z.object({ altText: z.string().max(500).optional(), caption: z.string().max(2000).optional() }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter valid image details (alt text up to 500 characters; caption up to 2000)." }, { status: 400 });
  try {
    if (!await prisma.media.findUnique({ where: { id }, select: { id: true } })) return NextResponse.json({ error: "Image not found." }, { status: 404 });
    const media = await prisma.media.update({ where: { id }, data: parsed.data });
    for (const tag of Object.values(TAGS)) revalidateTag(tag);
    await logActivity({ userId: session.user.id, action: "update", entity: "Media", entityId: id });
    return NextResponse.json({ media });
  } catch (err) {
    console.error("[media update]", err);
    return NextResponse.json({ error: "Could not save image details. Please try again." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!/^[a-f0-9]{24}$/i.test(id)) return NextResponse.json({ error: "Invalid media ID." }, { status: 400 });
  try {
    await deleteMedia(id);
    await logActivity({ userId: session.user.id, action: "delete", entity: "Media", entityId: id });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof MediaInUseError) return NextResponse.json({ error: err.message }, { status: 409 });
    console.error("[media delete]", err);
    return NextResponse.json({ error: "Could not delete the image. Please try again." }, { status: 500 });
  }
}
