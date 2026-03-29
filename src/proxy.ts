import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/@")) {
    const handle = request.nextUrl.pathname.slice(2);
    if (handle) {
      const url = request.nextUrl.clone();
      url.pathname = `/profile/${handle}`;
      return NextResponse.rewrite(url);
    }
  }
  return updateSession(request);
}

export const config = {
  matcher: ["/app/:path*", "/m/:path*", "/auth/:path*", "/@:path*"],
};
