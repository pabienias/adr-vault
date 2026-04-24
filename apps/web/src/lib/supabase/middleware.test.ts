import type { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { updateSession } from './middleware';

const { mockCreateServerClient, mockGetUser } = vi.hoisted(() => ({
	mockCreateServerClient: vi.fn(),
	mockGetUser: vi.fn(),
}));

vi.mock('@supabase/ssr', () => ({
	createServerClient: mockCreateServerClient,
}));

vi.mock('next/server', () => ({
	NextResponse: {
		next: vi.fn(({ request }: { request: NextRequest }) => ({
			__kind: 'NextResponse',
			request,
			cookies: { set: vi.fn() },
		})),
	},
}));

type CookieAdapter = {
	getAll: () => { name: string; value: string }[];
	setAll: (
		cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[],
	) => void;
};

function buildRequest(): NextRequest & {
	cookies: { getAll: ReturnType<typeof vi.fn>; set: ReturnType<typeof vi.fn> };
} {
	return {
		cookies: {
			getAll: vi.fn().mockReturnValue([]),
			set: vi.fn(),
		},
		nextUrl: { pathname: '/', clone: (): URL => new URL('http://localhost:3000/') },
	} as unknown as NextRequest & {
		cookies: { getAll: ReturnType<typeof vi.fn>; set: ReturnType<typeof vi.fn> };
	};
}

describe('updateSession', () => {
	beforeEach(() => {
		mockCreateServerClient.mockReset();
		mockGetUser.mockReset();
		mockCreateServerClient.mockImplementation(() => ({
			auth: { getUser: mockGetUser },
		}));
		mockGetUser.mockResolvedValue({ data: { user: null } });
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it('creates a server client with the env vars and returns the user from getUser', async () => {
		vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://localhost:54321');
		vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');

		mockGetUser.mockResolvedValue({
			data: { user: { id: 'user-123', email: 'a@b.co' } },
		});

		const result = await updateSession(buildRequest());

		expect(mockCreateServerClient).toHaveBeenCalledWith(
			'http://localhost:54321',
			'test-anon-key',
			expect.objectContaining({ cookies: expect.any(Object) }),
		);
		expect(mockGetUser).toHaveBeenCalledTimes(1);
		expect(result.user).toEqual({ id: 'user-123', email: 'a@b.co' });
		expect(result.response).toBeDefined();
	});

	it('returns null user when Supabase reports none', async () => {
		vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://localhost:54321');
		vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');

		const result = await updateSession(buildRequest());

		expect(result.user).toBeNull();
	});

	it('getAll adapter reads cookies from the request', async () => {
		vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://localhost:54321');
		vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');

		const request = buildRequest();
		request.cookies.getAll.mockReturnValue([
			{ name: 'sb-access-token', value: 'abc' },
			{ name: 'sb-refresh-token', value: 'def' },
		]);

		await updateSession(request);

		const options = mockCreateServerClient.mock.calls[0]?.[2] as { cookies: CookieAdapter };
		expect(options.cookies.getAll()).toEqual([
			{ name: 'sb-access-token', value: 'abc' },
			{ name: 'sb-refresh-token', value: 'def' },
		]);
		expect(request.cookies.getAll).toHaveBeenCalled();
	});

	it('setAll adapter writes cookies to the request and to a new response', async () => {
		vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://localhost:54321');
		vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');

		const request = buildRequest();

		await updateSession(request);

		const options = mockCreateServerClient.mock.calls[0]?.[2] as { cookies: CookieAdapter };
		options.cookies.setAll([
			{ name: 'sb-access-token', value: 'abc', options: { path: '/' } },
			{ name: 'sb-refresh-token', value: 'def', options: { path: '/' } },
		]);

		expect(request.cookies.set).toHaveBeenCalledTimes(2);
		expect(request.cookies.set).toHaveBeenNthCalledWith(1, 'sb-access-token', 'abc');
		expect(request.cookies.set).toHaveBeenNthCalledWith(2, 'sb-refresh-token', 'def');
	});

	it('throws when NEXT_PUBLIC_SUPABASE_URL is missing', async () => {
		vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
		vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');

		await expect(updateSession(buildRequest())).rejects.toThrow('Missing NEXT_PUBLIC_SUPABASE_URL');
	});

	it('throws when NEXT_PUBLIC_SUPABASE_ANON_KEY is missing', async () => {
		vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://localhost:54321');
		vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '');

		await expect(updateSession(buildRequest())).rejects.toThrow('Missing NEXT_PUBLIC_SUPABASE_URL');
	});
});
