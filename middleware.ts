import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// A direct NextResponse keeps the page body. The Auth.js wrapper copies that
// response and can return an empty document once a session cookie is present.
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path.startsWith("/operate/d/") || path === "/operate/sign-in") return NextResponse.next();
  if (!path.startsWith("/operate")) return NextResponse.next();

  const secureCookie = request.nextUrl.protocol === "https:";
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie,
  });
  if (token) return NextResponse.next();

  return NextResponse.redirect(new URL("/operate/sign-in", request.nextUrl.origin));
}

export const config = {
  // Sign-in and /operate/d/ stay outside the session check. A missing AUTH_SECRET must not take down the customer link.
  matcher: ["/operate", "/operate/((?!sign-in|d/).*)"],
};
