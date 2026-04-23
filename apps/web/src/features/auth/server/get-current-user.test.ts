import type { User } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetUser = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
	createClient: vi.fn(async () => ({
		auth: { getUser: mockGetUser },
	})),
}));

import { getCurrentUser } from './get-current-user';

function makeUser(overrides: Partial<User> = {}): User {
	return {
		id: 'user-1',
		email: 'alice@example.com',
		user_metadata: {},
		app_metadata: {},
		aud: 'authenticated',
		created_at: '2026-04-23T00:00:00Z',
		...overrides,
	} as User;
}

describe('getCurrentUser', () => {
	beforeEach(() => {
		mockGetUser.mockReset();
	});

	it('returns id, email, and display name when present', async () => {
		mockGetUser.mockResolvedValueOnce({
			data: { user: makeUser({ user_metadata: { display_name: 'Alice' } }) },
		});

		await expect(getCurrentUser()).resolves.toEqual({
			id: 'user-1',
			email: 'alice@example.com',
			displayName: 'Alice',
		});
	});

	it('returns displayName null when user_metadata has no display_name', async () => {
		mockGetUser.mockResolvedValueOnce({
			data: { user: makeUser({ user_metadata: {} }) },
		});

		const result = await getCurrentUser();

		expect(result.displayName).toBeNull();
	});

	it('treats empty-string display_name as null', async () => {
		mockGetUser.mockResolvedValueOnce({
			data: { user: makeUser({ user_metadata: { display_name: '   ' } }) },
		});

		const result = await getCurrentUser();

		expect(result.displayName).toBeNull();
	});

	it('treats non-string display_name as null', async () => {
		mockGetUser.mockResolvedValueOnce({
			data: { user: makeUser({ user_metadata: { display_name: 42 } }) },
		});

		const result = await getCurrentUser();

		expect(result.displayName).toBeNull();
	});

	it('falls back to empty string when user.email is absent', async () => {
		mockGetUser.mockResolvedValueOnce({
			data: { user: makeUser({ email: undefined }) },
		});

		const result = await getCurrentUser();

		expect(result.email).toBe('');
	});

	it('throws when Supabase returns no user', async () => {
		mockGetUser.mockResolvedValueOnce({ data: { user: null } });

		await expect(getCurrentUser()).rejects.toThrow(
			'getCurrentUser called without an authenticated user',
		);
	});
});
