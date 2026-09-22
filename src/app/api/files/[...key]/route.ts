import { NextResponse } from "next/server";
import { LocalStorageProvider } from "@/lib/storage";
import { env } from "@/lib/env";

export const runtime = "nodejs";

const mimeByExt: Record<string, string> = {
  webp: "image/webp",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  svg: "image/svg+xml",
  avif: "image/avif",
};

/** Serves files stored by the local storage provider. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string[] }> }
) {
  if (env.storage.provider !== "local") {
    return new NextResponse("Not found", { status: 404 });
  }

  const { key } = await params;
  const joined = key.map(decodeURIComponent).join("/");
  const ext = joined.split(".").pop()?.toLowerCase() ?? "";
  const contentType = mimeByExt[ext] ?? "application/octet-stream";

  try {
    const provider = new LocalStorageProvider();
    const buffer = await provider.read(joined);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
