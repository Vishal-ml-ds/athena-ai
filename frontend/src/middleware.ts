// Middleware disabled for Next.js 16 compatibility
// Auth is handled client-side via Supabase
import { NextResponse, type NextRequest } from "next/server";

export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
