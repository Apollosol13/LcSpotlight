import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  getPublicSupabaseAnonKey,
  getPublicSupabaseUrl,
} from "@/lib/supabase-env";
import { getPortalAccess } from "@/lib/portal-role";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname === "/admin/login" || pathname === "/business/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

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

  const isAdminRoute = pathname.startsWith("/admin");
  const isBusinessRoute = pathname.startsWith("/business");
  const isLogin = pathname === "/login";

  const redirect = (path: string) => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    return NextResponse.redirect(url);
  };

  if (!user) {
    if (isAdminRoute) return redirect("/login");
    if (isBusinessRoute) return redirect("/login");
    if (isLogin) return supabaseResponse;
    return supabaseResponse;
  }

  const access = await getPortalAccess(supabase, user.id);

  if (isLogin) {
    if (access.isPartnerOnly) return redirect("/business");
    return redirect("/admin");
  }

  if (isAdminRoute && access.isPartnerOnly) return redirect("/business");

  return supabaseResponse;
}

export const config = {
  matcher: ["/login", "/admin/:path*", "/business/:path*"],
};
