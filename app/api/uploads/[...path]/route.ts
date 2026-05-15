import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy route for uploaded product images.
 *
 * Why this exists:
 * The FastAPI backend returns image_url as "http://api:8000/uploads/…" (Docker
 * internal hostname). The browser and next/image optimizer cannot use that URL
 * directly. This route proxies the request so all image paths stay relative to
 * the Next.js origin ("/api/uploads/…"), which works in every environment:
 *   • Docker/Podman  → fetches http://api:8000/uploads/… (internal network)
 *   • Windows native → fetches http://localhost:8000/uploads/… (NEXT_PUBLIC_API_URL)
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const base =
    process.env.API_INTERNAL_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:8000";

  const url = `${base}/uploads/${path.join("/")}`;

  let upstream: Response;
  try {
    upstream = await fetch(url, { cache: "force-cache" });
  } catch (error) {
    console.error("Upload proxy upstream error", { url, error });
    return new NextResponse(null, { status: 502 });
  }

  if (!upstream.ok) {
    return new NextResponse(null, { status: upstream.status });
  }

  const body = await upstream.arrayBuffer();
  const contentType = upstream.headers.get("content-type") ?? "image/jpeg";

  return new NextResponse(body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
