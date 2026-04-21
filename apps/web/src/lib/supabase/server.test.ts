import type { CookieMethodsServer } from '@supabase/ssr';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type ServerClientOptions = { cookies: Required<CookieMethodsServer> };

const mockCreateServerClient = vi.fn();
const mockCookieStore = {
	getAll: vi.fn(),
	set: vi.fn(),
};
const mockCookies = vi.fn(async () => mockCookieStore);

function getCookieAdapter(): Required<CookieMethodsServer> {
	const call = mockCreateServerClient.mock.calls[0];
	if (!call) {
		throw new Error('createServerClient was not called');
	}
	const options = call[2] as ServerClientOptions;
	return options.cookies;
}

vi.mock('@supabase/ssr', () => ({
	createServerClient: mockCreateServerClient,
}));

vi.mock('next/headers', () => ({
	cookies: mockCookies,
}));

describe('createClient (server)', () => {
	beforeEach(() => {
		mockCreateServerClient.mockReset();
		mockCookieStore.getAll.mockReset();
		mockCookieStore.set.mockReset();
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it('calls createServerClient with env vars and a cookie adapter', async () => {
		vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://localhost:54321');
		vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');

		mockCreateServerClient.mockReturnValue({});

		const { createClient } = await import('./server.js');
		await createClient();

		expect(mockCreateServerClient).toHaveBeenCalledTimes(1);
		const call = mockCreateServerClient.mock.calls[0];
		if (!call) {
			throw new Error('createServerClient was not called');
		}
		const [url, key, options] = call as [string, string, ServerClientOptions];
		expect(url).toBe('http://localhost:54321');
		expect(key).toBe('test-anon-key');
		expect(options.cookies).toBeDefined();
		expect(typeof options.cookies.getAll).toBe('function');
		expect(typeof options.cookies.setAll).toBe('function');
	});

	it('throws when NEXT_PUBLIC_SUPABASE_URL is missing', async () => {
		vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
		vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');

		const { createClient } = await import('./server.js');

		await expect(createClient()).rejects.toThrow('Missing NEXT_PUBLIC_SUPABASE_URL');
	});

	it('throws when NEXT_PUBLIC_SUPABASE_ANON_KEY is missing', async () => {
		vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://localhost:54321');
		vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '');

		const { createClient } = await import('./server.js');

		await expect(createClient()).rejects.toThrow('Missing NEXT_PUBLIC_SUPABASE_URL');
	});

	it('getAll adapter returns cookies from the Next.js cookie store', async () => {
		vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://localhost:54321');
		vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');

		mockCookieStore.getAll.mockReturnValue([
			{ name: 'sb-access-token', value: 'abc' },
			{ name: 'sb-refresh-token', value: 'def' },
		]);
		mockCreateServerClient.mockReturnValue({});

		const { createClient } = await import('./server.js');
		await createClient();

		const adapter = getCookieAdapter();
		const result = await adapter.getAll();

		expect(result).toEqual([
			{ name: 'sb-access-token', value: 'abc' },
			{ name: 'sb-refresh-token', value: 'def' },
		]);
	});

	it('setAll adapter writes each cookie to the Next.js cookie store', async () => {
		vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://localhost:54321');
		vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');

		mockCreateServerClient.mockReturnValue({});

		const { createClient } = await import('./server.js');
		await createClient();

		const adapter = getCookieAdapter();
		await adapter.setAll(
			[
				{ name: 'sb-access-token', value: 'abc', options: { path: '/' } },
				{ name: 'sb-refresh-token', value: 'def', options: { path: '/' } },
			],
			{},
		);

		expect(mockCookieStore.set).toHaveBeenCalledTimes(2);
		expect(mockCookieStore.set).toHaveBeenNthCalledWith(1, 'sb-access-token', 'abc', {
			path: '/',
		});
		expect(mockCookieStore.set).toHaveBeenNthCalledWith(2, 'sb-refresh-token', 'def', {
			path: '/',
		});
	});

	it('setAll adapter swallows errors when Server Components cannot set cookies', async () => {
		vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://localhost:54321');
		vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');

		mockCookieStore.set.mockImplementation(() => {
			throw new Error('Cookies can only be modified in a Server Action or Route Handler');
		});
		mockCreateServerClient.mockReturnValue({});

		const { createClient } = await import('./server.js');
		await createClient();

		const adapter = getCookieAdapter();

		expect(() =>
			adapter.setAll([{ name: 'sb-access-token', value: 'abc', options: { path: '/' } }], {}),
		).not.toThrow();
	});
});
