import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { deleteMedia } from "@/lib/media/upload";
import { logActivity } from "@/lib/activity";

export const runtime = "nodejs";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const media = await prisma.media.update({
    where: { id },
    data: {
      altText: typeof body.altText === "string" ? body.altText : undefined,
      caption: typeof body.caption === "string" ? body.caption : undefined,
    },
  });
  return NextResponse.json({ media });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    await deleteMedia(id);
    await logActivity({ userId: session.user.id, action: "delete", entity: "Media", entityId: id });
    return NextResponse.json({ ok: true });
  } catch (err) {
    // Likely a foreign-key constraint (media still in use).
    console.error("[media delete]", err);
    return NextResponse.json(
      { error: "This file is still used by content and can't be deleted." },
      { status: 409 }
    );
  }
}
