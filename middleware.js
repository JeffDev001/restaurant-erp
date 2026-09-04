import { NextResponse } from "next/server";

const SESSION_COOKIE = "restaurant_erp_session";

const routePermissions = {
  "/dashboard": ["ADMIN", "MANAGER", "STAFF"],
  "/menu": ["ADMIN", "MANAGER"],
  "/orders": ["ADMIN", "MANAGER", "STAFF"],
  "/inventory": ["ADMIN", "MANAGER"],
  "/staff": ["ADMIN"],
  "/sales": ["ADMIN", "MANAGER"],
};

function getRequiredRoles(pathname) {
  for (const route in routePermissions) {
    if (
      pathname === route ||
      pathname.startsWith(`${route}/`)
    ) {
      return routePermissions[route];
    }
  }

  return null;
}

export function middleware(request) {
  const { pathname } = request.nextUrl;

  const requiredRoles = getRequiredRoles(pathname);

  // Public route
  if (!requiredRoles) {
    return NextResponse.next();
  }

  const session = request.cookies.get(SESSION_COOKIE)?.value;

  // Not logged in
  if (!session) {
    const loginUrl = new URL("/login", request.url);

    loginUrl.searchParams.set(
      "redirect",
      pathname
    );

    return NextResponse.redirect(loginUrl);
  }

  // Session format:
  // userId:randomToken
  const [userId] = session.split(":");

  if (!userId) {
    const loginUrl = new URL("/login", request.url);

    return NextResponse.redirect(loginUrl);
  }

  /*
   * The middleware cannot safely query Prisma directly here
   * in our current setup, so the actual role authorization
   * will be enforced by the protected pages/API layer.
   */

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/menu/:path*",
    "/orders/:path*",
    "/inventory/:path*",
    "/staff/:path*",
    "/sales/:path*",
  ],
};