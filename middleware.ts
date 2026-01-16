import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Protected routes that require authentication
const protectedRoutes = ["/cart"]; // Add more protected routes here
// Or match all routes under (proteceted_pages) folder
const protectedRoutePattern = /^\/(cart|dashboard|profile)/; // Add your protected routes

// Auth routes (login, signup) - redirect to home if already authenticated
const authRoutes = ["/sign-in", "/sign-up", "/verify-email"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes, static files, and Next.js internals
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|webp|avif)$/)
  ) {
    return NextResponse.next();
  }

  // Get cookies from request
  const cookies = request.cookies.toString();

  // Check if route is protected
  const isProtectedRoute = protectedRoutePattern.test(pathname) || protectedRoutes.includes(pathname);

  // Check if route is auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Verify authentication by calling backend
  let isAuthenticated = false;

  if (isProtectedRoute || isAuthRoute) {
    try {
      // Call backend to verify cookie
      const backendUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
      const verifyUrl = `${backendUrl}/auth/verify`;

      const response = await fetch(verifyUrl, {
        method: "GET",
        headers: {
          Cookie: cookies, // Forward cookies to backend
        },
        credentials: "include",
      });

      isAuthenticated = response.ok; // 200 = authenticated, 401 = not authenticated
    } catch (error) {
      // If backend call fails, assume not authenticated
      isAuthenticated = false;
    }
  }

  // Handle protected routes
  if (isProtectedRoute && !isAuthenticated) {
    // Redirect to login if trying to access protected route without auth
    const loginUrl = new URL("/sign-in", request.url);
    loginUrl.searchParams.set("redirect", pathname); // Save intended destination
    return NextResponse.redirect(loginUrl);
  }

  // Handle auth routes
  if (isAuthRoute && isAuthenticated) {
    // Redirect to home if already authenticated and trying to access auth pages
    const response = NextResponse.redirect(new URL("/", request.url));
    // Prevent caching
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
    return response;
  }

  // Add cache headers for auth routes (prevent caching)
  if (isAuthRoute) {
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    return response;
  }

  // Allow request to continue
  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)",
  ],
};

