import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: Array<{ name: string; value: string; options?: any }>
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session to ensure cookies are properly set
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  const user = session?.user;

  // Debug logging in development
  if (
    process.env.NODE_ENV === "development" &&
    request.nextUrl.pathname.startsWith("/admin")
  ) {
    const allCookies = request.cookies.getAll();
    const supabaseCookies = allCookies.filter((c) => c.name.startsWith("sb-"));

    console.log("[Middleware Debug]", {
      path: request.nextUrl.pathname,
      hasUser: !!user,
      hasSession: !!session,
      userId: user?.id,
      sessionError: sessionError?.message,
      cookieCount: supabaseCookies.length,
      cookieNames: supabaseCookies.map((c) => c.name),
    });
  }

  // Protect admin routes - redirect to login if not authenticated
  // But exclude login, signup, and setup pages to avoid loops
  if (
    request.nextUrl.pathname.startsWith("/admin") &&
    request.nextUrl.pathname !== "/admin/login" &&
    request.nextUrl.pathname !== "/admin/signup" &&
    request.nextUrl.pathname !== "/admin/setup" &&
    !user
  ) {
    const redirectUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Don't redirect authenticated users away from login/signup in middleware
  // Let the page components handle this to avoid redirect loops

  return supabaseResponse;
}
