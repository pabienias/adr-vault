import { afterEach, describe, expect, it, vi } from 'vitest';

const mockCreateBrowserClient = vi.fn();

vi.mock('@supabase/ssr', () => ({
	createBrowserClient: mockCreateBrowserClient,
}));

describe('createClient', () => {
	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllEnvs();
	});

	it('calls createBrowserClient with env vars', async () => {
		vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://localhost:54321');
		vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');

		mockCreateBrowserClient.mockReturnValue({});

		const { createClient } = await import('./client.js');
		createClient();

		expect(mockCreateBrowserClient).toHaveBeenCalledWith('http://localhost:54321', 'test-anon-key');
	});

	it('throws when NEXT_PUBLIC_SUPABASE_URL is missing', async () => {
		vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
		vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');

		const { createClient } = await import('./client.js');

		expect(() => createClient()).toThrow('Missing NEXT_PUBLIC_SUPABASE_URL');
	});

	it('throws when NEXT_PUBLIC_SUPABASE_ANON_KEY is missing', async () => {
		vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://localhost:54321');
		vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '');

		const { createClient } = await import('./client.js');

		expect(() => createClient()).toThrow('Missing NEXT_PUBLIC_SUPABASE_URL');
	});
});
