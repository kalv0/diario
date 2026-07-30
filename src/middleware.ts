import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

/**
 * Puerta de entrada: sin cookie de sesión válida solo se puede ver /login y /demo.
 * La comprobación es únicamente criptográfica (runtime edge, sin base de datos);
 * la existencia real del usuario la valida cada página con getCurrentUser().
 */
const PUBLIC_PATHS = ["/login", "/demo"];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);

  if (isPublic(pathname)) {
    // Con sesión abierta, /login redirige al diario.
    if (pathname === "/login" && session) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (!session) {
    const url = new URL("/login", request.url);
    if (pathname !== "/") url.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Todo menos:
     *  - /api  (las rutas de API comprueban la sesión ellas mismas)
     *  - assets de Next y ficheros estáticos
     */
    "/((?!api|_next/static|_next/image|favicon.ico|icon.svg|manifest.webmanifest).*)",
  ],
};
