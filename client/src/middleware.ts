// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const ROLE_PROTECTED_ROUTES: Record<string, string[]> = {
  "/dashboard/fees": ["admin"],
  "/dashboard/kyc": ["admin"],
  "/dashboard/users": ["admin"],
  "/dashboard/houses/post": ["admin", "client"],
  "/dashboard/houses/manage": ["admin", "client"],
  "/dashboard/cars/post": ["admin", "client"],
  "/dashboard/cars/manage": ["admin", "client"],
  "/dashboard/services/post": ["admin", "client"],
  "/dashboard/services/manage": ["admin", "client"],
  "/dashboard": ["admin", "client"],
};

const ROLE_REDIRECT: Record<string, string> = {
  client: "/dashboard",
  user: "/profile",
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Longest prefix wins
  const matchedRoute = Object.keys(ROLE_PROTECTED_ROUTES)
    .filter((route) => pathname.startsWith(route))
    .sort((a, b) => b.length - a.length)[0];

  if (!matchedRoute) return NextResponse.next();

  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    const roles = payload.roles as string[];
    const allowedRoles = ROLE_PROTECTED_ROUTES[matchedRoute];
    const hasAccess = roles.some((role) => allowedRoles.includes(role));

    if (!hasAccess) {
      // Find the highest-priority role the user has and redirect accordingly.
      // Priority order: client > user (fallback to /profile if unknown)
      const redirectTo = roles.includes("client")
        ? ROLE_REDIRECT.client
        : roles.includes("user")
          ? ROLE_REDIRECT.user
          : "/profile";

      return NextResponse.redirect(new URL(redirectTo, req.url));
    }

    const response = NextResponse.next();
    response.headers.set("x-user-id", payload.id as string);
    response.headers.set("x-user-roles", roles.join(","));
    return response;
  } catch (err) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: [],
};
