import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  COOKIE_NAME,
  isInviteGateEnabled,
  verifyAccessCookieValue,
} from "@/lib/membership-access";
import {
  getPublicSupabaseAnonKey,
  getPublicSupabaseUrl,
} from "@/lib/supabase-env";
import { getPortalAccess } from "@/lib/portal-role";
import { getSubscription, isSubscriptionActive } from "@/lib/subscription";

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

  const subscribePaths = pathname === "/subscribe" || pathname === "/subscribe/";
  if (subscribePaths && isInviteGateEnabled()) {
    const cookieOk = await verifyAccessCookieValue(
      request.cookies.get(COOKIE_NAME)?.value,
    );
    if (!cookieOk) {
      if (user) {
        const sub = await getSubscription(supabase, user.id);
        if (!isSubscriptionActive(sub)) {
          const url = request.nextUrl.clone();
          url.pathname = "/access";
          url.searchParams.set("next", "/subscribe");
          return NextResponse.redirect(url);
        }
      } else {
        const url = request.nextUrl.clone();
        url.pathname = "/access";
        url.searchParams.set("next", "/subscribe");
        return NextResponse.redirect(url);
      }
    }
  }

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
    if (access.isStaff) return redirect("/admin");
    return supabaseResponse;
  }

  if (isAdminRoute) {
    if (!access.isStaff) {
      if (access.isPartnerOnly) return redirect("/business");
      return redirect("/login");
    }
  }

  if (isBusinessRoute) {
    if (!access.isStaff && !access.isPartnerOnly) {
      return redirect("/login");
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/login", "/admin/:path*", "/business/:path*", "/subscribe"],
};
