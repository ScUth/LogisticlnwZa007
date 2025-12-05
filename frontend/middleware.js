import { NextResponse } from "next/server";

export function middleware(req) {
	const accessToken = req.cookies.get('accessToken')?.value;
	const url = req.nextUrl.clone();

	// If user is trying to access login or register page and is already authenticated, redirect to home
	if ((url.pathname === '/login' || url.pathname === '/register') && accessToken) {
		url.pathname = '/';
		return NextResponse.redirect(url);
	}
	// If user is trying to access protected routes without authentication, redirect to login
	const protectedRoutes = ['/shipment'];
	if (protectedRoutes.some(route => url.pathname.startsWith(route)) && !accessToken) {
		url.pathname = '/login';
		return NextResponse.redirect(url);
	}
}