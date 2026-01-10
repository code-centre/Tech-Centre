import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PROTECTED_PREFIXES = [
  "/admin",
  "/instructor",
  "/perfil",
  "/checkout",
];

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: { headers: req.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Solo verificar si hay usuario autenticado (NO consultar profiles)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = req.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some((p) => path.startsWith(p));

  if (isProtected && !user) {
    const url = req.nextUrl.clone();
    url.pathname = "/iniciar-sesion";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  // Si ya está logueado y entra a login/registro, redirigir a perfil
  if ((path === "/iniciar-sesion" || path === "/registro") && user) {
    const url = req.nextUrl.clone();
    url.pathname = "/perfil";
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: [
    // aplica a todo menos estáticos
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
