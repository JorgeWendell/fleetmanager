import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Verificar se tem cookie de sessão
  const sessionCookie = request.cookies.get("better-auth.session_token");

  // Se não está autenticado e não está na página de autenticação, redirecionar
  if (!sessionCookie && !request.nextUrl.pathname.startsWith("/authentication")) {
    return NextResponse.redirect(new URL("/authentication", request.url));
  }

  // Se está autenticado e está na página de autenticação, redirecionar para dashboard
  if (sessionCookie && request.nextUrl.pathname.startsWith("/authentication")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static files (images, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(png|jpg|jpeg|gif|svg|webp|ico)).*)",
  ],
};

