import { NextResponse } from "next/server";

export function middleware(req) {
  const accessToken = req.cookies.get("accessToken")?.value;
  const employeeAccessToken = req.cookies.get("employeeAccessToken")?.value;
  const adminAccessToken = req.cookies.get("adminAccessToken")?.value;

  const url = req.nextUrl.clone();

  // If user is trying to access login or register page and is already authenticated, redirect to home
  if (
    (url.pathname === "/login" || url.pathname === "/register") &&
    accessToken
  ) {
    url.pathname = "/";
    return NextResponse.redirect(url);
  }
  // If user is trying to access protected routes without authentication, redirect to login
  const protectedRoutes = ["/shipment"];
  if (
    protectedRoutes.some((route) => url.pathname.startsWith(route)) &&
    !accessToken
  ) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  const employeeProtectedRoutes = ["/employee"];
  // except /employee/login
  if (
    employeeProtectedRoutes.some((route) => url.pathname.startsWith(route)) &&
    !employeeAccessToken &&
    url.pathname !== "/employee/login"
  ) {
    url.pathname = "/employee/login";
    return NextResponse.redirect(url);
  }

  const adminProtectedRoutes = ["/admin"];
  if (adminProtectedRoutes.some((route) => url.pathname.startsWith(route)) && !adminAccessToken && url.pathname !== "/admin/login") {
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }       
}
