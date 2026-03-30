import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  getPublicSupabaseAnonKey,
  getPublicSupabaseUrl,
} from "@/lib/supabase-env";
import { getEffectivePortalRole } from "@/lib/portal-role";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    getPublicSupabaseUrl(),
    getPublicSupabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith("/admin");
  const isBusinessRoute = pathname.startsWith("/business");
  const isAdminLogin = pathname === "/admin/login";
  const isBusinessLogin = pathname === "/business/login";

  const redirect = (path: string) => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    return NextResponse.redirect(url);
  };

  if (!user) {
    if (isAdminRoute && !isAdminLogin) return redirect("/admin/login");
    if (isBusinessRoute && !isBusinessLogin) return redirect("/business/login");
    return supabaseResponse;
  }

  const role = await getEffectivePortalRole(supabase, user.id);

  if (isAdminLogin) {
    if (role === "business") return redirect("/business");
    return redirect("/admin");
  }

  if (isBusinessLogin) {
    if (role === "admin") return redirect("/admin");
    return redirect("/business");
  }

  if (isAdminRoute && role === "business") return redirect("/business");
  if (isBusinessRoute && role === "admin") return redirect("/admin");

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*", "/business/:path*"],
};
