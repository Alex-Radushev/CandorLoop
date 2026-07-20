import { NextResponse } from "next/server";

import { securityHeaders } from "@/lib/security-headers";

export function proxy() {
  const response = NextResponse.next();

  for (const header of securityHeaders) {
    response.headers.set(header.key, header.value);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
