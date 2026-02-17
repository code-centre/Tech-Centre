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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = req.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some((p) => path.startsWith(p));
  const isAdminRoute = path.startsWith("/admin");
  const isInstructorRoute = path.startsWith("/instructor");

  if (isProtected && !user) {
    const url = req.nextUrl.clone();
    url.pathname = "/iniciar-sesion";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  // Rutas /admin: admin siempre; /admin/blog también permite instructores
  if (isAdminRoute && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    const role = (profile as { role?: string } | null)?.role;
    const isAdminBlogRoute = path.startsWith("/admin/blog");

    if (role === "admin") {
      // Admin puede todo
    } else if (isAdminBlogRoute && role === "instructor") {
      // Instructor solo puede /admin/blog
    } else {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  // Rutas /instructor: admin o instructor pueden acceder
  if (isInstructorRoute && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    const role = (profile as { role?: string } | null)?.role;
    const canAccessInstructor = role === "admin" || role === "instructor";
    if (!canAccessInstructor) {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
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
