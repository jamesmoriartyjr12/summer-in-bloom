import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const path = req.nextUrl.pathname;
  if (path.startsWith("/operate/d/") || path === "/operate/sign-in") return NextResponse.next();
  if (!path.startsWith("/operate")) return NextResponse.next();
  if (req.auth) return NextResponse.next();
  const signInUrl = new URL("/operate/sign-in", req.nextUrl.origin);
  return NextResponse.redirect(signInUrl);
});

export const config = {
  matcher: ["/operate/:path*"],
};
