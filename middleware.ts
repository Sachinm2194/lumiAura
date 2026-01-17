import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Protected routes that require authentication
const protectedRoutes = ["/cart", "/settings"   ]; // Add more protected routes here
// Or match all routes under (proteceted_pages) folder
const protectedRoutePattern = /^\/(cart|dashboard|profile|settings)/; // Add your protected routes

// Auth routes (login, signup) - redirect to home if already authenticated
const authRoutes = ["/sign-in", "/sign-up", "/verify-email",];

// Public routes that are accessible without authentication
const publicRoutes = ["/","/success"]; // Home page is public

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

  // Allow public routes without authentication check
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Properly format cookies for backend
  const cookieHeader = request.cookies
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  // Check if route is protected
  const isProtectedRoute = protectedRoutePattern.test(pathname) || protectedRoutes.includes(pathname);

  // Check if route is auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Fast check: if no cookies and protected route, redirect immediately
  const hasAuthCookie = request.cookies.has("lumi_a_t") || request.cookies.has("lumi_r_t");
  if (isProtectedRoute && !hasAuthCookie) {
    const loginUrl = new URL("/sign-in", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify authentication by calling backend
  let isAuthenticated = false;

  if (isProtectedRoute || isAuthRoute) {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
      if (!backendUrl) {
        console.error("NEXT_PUBLIC_BASE_URL is not set");
        isAuthenticated = false;
      } else {
        const verifyUrl = `${backendUrl}/auth/verify`;

      // Step 1: Call verify endpoint with timeout (2 seconds max)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      let verifyResponse = await fetch(verifyUrl, {
        method: "GET",
        headers: {
          Cookie: cookieHeader, // Forward cookies to backend
        },
        credentials: "include",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Step 2: If verify returns 401 AND we have refresh token, try to refresh
      if (verifyResponse.status === 401 && hasAuthCookie && backendUrl) {
        const refreshUrl = `${backendUrl}/auth/refresh`;
        
        try {
          // Call refresh endpoint with timeout (2 seconds max)
          const refreshController = new AbortController();
          const refreshTimeoutId = setTimeout(() => refreshController.abort(), 2000);

          const refreshResponse = await fetch(refreshUrl, {
            method: "POST",
            headers: {
              Cookie: cookieHeader, // Forward cookies to backend
              "Content-Type": "application/json",
            },
            credentials: "include",
            signal: refreshController.signal,
          });

          clearTimeout(refreshTimeoutId);

          // Step 3: If refresh succeeds, extract new cookies and retry verify
          if (refreshResponse.ok) {
            // Try to get Set-Cookie headers (may not be accessible in all environments)
            // Use getSetCookie() if available (Node.js 18+), otherwise try headers.get()
            let setCookieHeaders: string[] = [];
            
            // Try Node.js getSetCookie() method first
            if (typeof (refreshResponse.headers as any).getSetCookie === 'function') {
              setCookieHeaders = (refreshResponse.headers as any).getSetCookie();
            } else {
              // Fallback: try to get Set-Cookie header manually
              const setCookieHeader = refreshResponse.headers.get('set-cookie');
              if (setCookieHeader) {
                setCookieHeaders = [setCookieHeader];
              }
            }
            
            // Build updated cookie header with new cookies from refresh
            const existingCookies = request.cookies.getAll();
            const cookieMap = new Map<string, string>();
            
            // Add all existing cookies
            existingCookies.forEach(cookie => {
              cookieMap.set(cookie.name, cookie.value);
            });
            
            // Extract and add new cookies from Set-Cookie headers
            setCookieHeaders.forEach(setCookie => {
              // Extract cookie name=value from Set-Cookie header (format: "name=value; path=/; ...")
              const cookieMatch = setCookie.match(/([^=]+)=([^;]+)/);
              if (cookieMatch) {
                const cookieName = cookieMatch[1].trim();
                const cookieValue = cookieMatch[2].trim();
                cookieMap.set(cookieName, cookieValue);
              }
            });
            
            // Build updated cookie header (use original if no new cookies extracted)
            const updatedCookieHeader = cookieMap.size > existingCookies.length
              ? Array.from(cookieMap.entries())
                  .map(([name, value]) => `${name}=${value}`)
                  .join("; ")
              : cookieHeader; // Fallback to original if extraction failed
            
            // Retry verify with updated cookies (includes new access token) with timeout
            const retryController = new AbortController();
            const retryTimeoutId = setTimeout(() => retryController.abort(), 2000);

            verifyResponse = await fetch(verifyUrl, {
              method: "GET",
              headers: {
                Cookie: updatedCookieHeader,
              },
              credentials: "include",
              signal: retryController.signal,
            });

            clearTimeout(retryTimeoutId);
            isAuthenticated = verifyResponse.ok; // 200 = authenticated
          } else {
            // Refresh failed - user needs to login, redirect immediately
            isAuthenticated = false;
            // Don't wait, redirect immediately if refresh fails
            if (isProtectedRoute) {
              const loginUrl = new URL("/sign-in", request.url);
              loginUrl.searchParams.set("redirect", pathname);
              return NextResponse.redirect(loginUrl, 307);
            }
          }
        } catch (refreshError) {
          // Refresh call failed - user needs to login, redirect immediately
          isAuthenticated = false;
          // Don't wait, redirect immediately if refresh fails
          if (isProtectedRoute) {
            const loginUrl = new URL("/sign-in", request.url);
            loginUrl.searchParams.set("redirect", pathname);
            return NextResponse.redirect(loginUrl, 307);
          }
        }
      } else {
        // Verify returned 200 or other status
        isAuthenticated = verifyResponse.ok; // 200 = authenticated
      }
      }
    } catch (error: any) {
      // If backend call fails or times out, assume not authenticated
      if (error.name === 'AbortError') {
        // Timeout - assume not authenticated to be safe
        isAuthenticated = false;
      } else {
        // Other errors - assume not authenticated
        isAuthenticated = false;
      }
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

