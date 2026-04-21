import { AuthError } from '@supabase/supabase-js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { LoginFormValues } from '../schemas/login-schema';
import { useLogin } from './use-login.js';

const mockSignInWithPassword = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
	createClient: (): unknown => ({
		auth: {
			signInWithPassword: mockSignInWithPassword,
		},
	}),
}));

const validInput: LoginFormValues = {
	email: 'test@example.com',
	password: 'securepass',
};

function createWrapper(): ({ children }: { children: ReactNode }) => ReactNode {
	const queryClient = new QueryClient({
		defaultOptions: {
			mutations: { retry: false },
		},
	});

	return function Wrapper({ children }: { children: ReactNode }): ReactNode {
		return QueryClientProvider({ client: queryClient, children });
	};
}

describe('useLogin', () => {
	beforeEach(() => {
		mockSignInWithPassword.mockReset();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('returns auth data on success', async () => {
		const mockUser = { id: 'user-123', email: 'test@example.com' };
		const mockSession = { access_token: 'token-abc' };

		mockSignInWithPassword.mockResolvedValue({
			data: { user: mockUser, session: mockSession },
			error: null,
		});

		const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

		result.current.mutate(validInput);

		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true);
		});

		expect(result.current.data).toEqual({ user: mockUser, session: mockSession });
		expect(mockSignInWithPassword).toHaveBeenCalledWith({
			email: 'test@example.com',
			password: 'securepass',
		});
	});

	it('throws mapped error for invalid credentials', async () => {
		mockSignInWithPassword.mockResolvedValue({
			data: { user: null, session: null },
			error: new AuthError('Invalid login credentials', 400, 'invalid_credentials'),
		});

		const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

		result.current.mutate(validInput);

		await waitFor(() => {
			expect(result.current.isError).toBe(true);
		});

		expect(result.current.error?.message).toBe('Invalid email or password.');
	});

	it('throws mapped error for unconfirmed email', async () => {
		mockSignInWithPassword.mockResolvedValue({
			data: { user: null, session: null },
			error: new AuthError('Email not confirmed', 400, 'email_not_confirmed'),
		});

		const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

		result.current.mutate(validInput);

		await waitFor(() => {
			expect(result.current.isError).toBe(true);
		});

		expect(result.current.error?.message).toBe(
			'Please verify your email address before signing in.',
		);
	});

	it('throws generic message for network errors', async () => {
		mockSignInWithPassword.mockResolvedValue({
			data: { user: null, session: null },
			error: new AuthError('Failed to fetch'),
		});

		const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

		result.current.mutate(validInput);

		await waitFor(() => {
			expect(result.current.isError).toBe(true);
		});

		expect(result.current.error?.message).toBe('Something went wrong. Please try again.');
	});

	it('throws error when user is null', async () => {
		mockSignInWithPassword.mockResolvedValue({
			data: { user: null, session: null },
			error: null,
		});

		const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

		result.current.mutate(validInput);

		await waitFor(() => {
			expect(result.current.isError).toBe(true);
		});

		expect(result.current.error?.message).toBe('Login failed. Please try again.');
	});
});
