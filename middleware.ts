import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(_request: NextRequest) {
  const response = NextResponse.next();
  return response;
}

export const config = {
  matcher: "/api/:path*",
};
