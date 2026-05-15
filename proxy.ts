import { NextRequest, NextResponse } from "next/server";

// Next.js 16: renamed from middleware.ts → proxy.ts, and function named "proxy"
export const config = {
  matcher: ["/admin/:path*"],
};

export function proxy(request: NextRequest) {
  // Allow access to the login page without a token
  if (request.nextUrl.pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get("admin_token")?.value;

  if (!token) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Decode JWT payload to check expiry (no secret needed — full verification is in server actions)
  try {
    const [, payloadB64] = token.split(".");
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf-8"));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      const loginUrl = new URL("/admin/login", request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("admin_token");
      return response;
    }
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Invalid admin_token cookie", error);
    }
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
