import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

const AUTH_ROUTES = new Set(['/login', '/register']);

function isAuthRoute(pathname: string): boolean {
	return AUTH_ROUTES.has(pathname);
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
	const { response, user } = await updateSession(request);
	const pathname = request.nextUrl.pathname;

	if (!user && !isAuthRoute(pathname)) {
		const redirectUrl = request.nextUrl.clone();
		redirectUrl.pathname = '/login';
		redirectUrl.search = '';
		return NextResponse.redirect(redirectUrl);
	}

	if (user && isAuthRoute(pathname)) {
		const redirectUrl = request.nextUrl.clone();
		redirectUrl.pathname = '/';
		redirectUrl.search = '';
		return NextResponse.redirect(redirectUrl);
	}

	return response;
}

export const config = {
	matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
