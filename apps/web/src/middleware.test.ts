import type { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config, middleware } from './middleware';

const { mockUpdateSession, mockRedirect, mockNext } = vi.hoisted(() => ({
	mockUpdateSession: vi.fn(),
	mockRedirect: vi.fn(),
	mockNext: vi.fn(),
}));

vi.mock('@/lib/supabase/middleware', () => ({
	updateSession: mockUpdateSession,
}));

vi.mock('next/server', () => ({
	NextResponse: {
		redirect: mockRedirect,
		next: mockNext,
	},
}));

type User = { id: string; email: string };

function buildRequest(pathname: string): NextRequest {
	return {
		nextUrl: {
			pathname,
			clone: (): URL => new URL(`http://localhost:3000${pathname}`),
		},
	} as unknown as NextRequest;
}

function stubResponse(tag: string): object {
	return { __tag: tag };
}

describe('middleware', () => {
	beforeEach(() => {
		mockUpdateSession.mockReset();
		mockRedirect.mockReset();
		mockNext.mockReset();
		mockRedirect.mockImplementation((url: URL) => stubResponse(`redirect:${url.pathname}`));
	});

	it('redirects unauthenticated requests to an app route to /login', async () => {
		const passthrough = stubResponse('next');
		mockUpdateSession.mockResolvedValue({ response: passthrough, user: null });

		const result = await middleware(buildRequest('/'));

		expect(mockRedirect).toHaveBeenCalledTimes(1);
		const redirectArg = mockRedirect.mock.calls[0]?.[0] as URL;
		expect(redirectArg.pathname).toBe('/login');
		expect(result).toEqual(stubResponse('redirect:/login'));
	});

	it('redirects authenticated requests to /login to the home route', async () => {
		const passthrough = stubResponse('next');
		const user: User = { id: 'user-123', email: 'a@b.co' };
		mockUpdateSession.mockResolvedValue({ response: passthrough, user });

		const result = await middleware(buildRequest('/login'));

		expect(mockRedirect).toHaveBeenCalledTimes(1);
		const redirectArg = mockRedirect.mock.calls[0]?.[0] as URL;
		expect(redirectArg.pathname).toBe('/');
		expect(result).toEqual(stubResponse('redirect:/'));
	});

	it('redirects authenticated requests to /register to the home route', async () => {
		const passthrough = stubResponse('next');
		const user: User = { id: 'user-123', email: 'a@b.co' };
		mockUpdateSession.mockResolvedValue({ response: passthrough, user });

		const result = await middleware(buildRequest('/register'));

		const redirectArg = mockRedirect.mock.calls[0]?.[0] as URL;
		expect(redirectArg.pathname).toBe('/');
		expect(result).toEqual(stubResponse('redirect:/'));
	});

	it('allows unauthenticated requests to /login through', async () => {
		const passthrough = stubResponse('next');
		mockUpdateSession.mockResolvedValue({ response: passthrough, user: null });

		const result = await middleware(buildRequest('/login'));

		expect(mockRedirect).not.toHaveBeenCalled();
		expect(result).toBe(passthrough);
	});

	it('allows unauthenticated requests to /register through', async () => {
		const passthrough = stubResponse('next');
		mockUpdateSession.mockResolvedValue({ response: passthrough, user: null });

		const result = await middleware(buildRequest('/register'));

		expect(mockRedirect).not.toHaveBeenCalled();
		expect(result).toBe(passthrough);
	});

	it('allows authenticated requests to app routes through', async () => {
		const passthrough = stubResponse('next');
		const user: User = { id: 'user-123', email: 'a@b.co' };
		mockUpdateSession.mockResolvedValue({ response: passthrough, user });

		const result = await middleware(buildRequest('/'));

		expect(mockRedirect).not.toHaveBeenCalled();
		expect(result).toBe(passthrough);
	});

	it('exports a matcher config excluding static assets and Next.js internals', () => {
		expect(config.matcher).toHaveLength(1);
		expect(config.matcher[0]).toContain('_next/static');
		expect(config.matcher[0]).toContain('_next/image');
		expect(config.matcher[0]).toContain('favicon.ico');
	});
});
