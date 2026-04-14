import { AuthError } from '@supabase/supabase-js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { RegistrationFormValues } from '../schemas/registration-schema';
import { useRegister } from './use-register.js';

const mockSignUp = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
	createClient: (): unknown => ({
		auth: {
			signUp: mockSignUp,
		},
	}),
}));

const validInput: RegistrationFormValues = {
	email: 'test@example.com',
	password: 'securepass',
	displayName: 'Alice',
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

describe('useRegister', () => {
	beforeEach(() => {
		mockSignUp.mockReset();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('returns signup data on success', async () => {
		const mockUser = { id: 'user-123', email: 'test@example.com' };
		const mockSession = { access_token: 'token-abc' };

		mockSignUp.mockResolvedValue({
			data: { user: mockUser, session: mockSession },
			error: null,
		});

		const { result } = renderHook(() => useRegister(), { wrapper: createWrapper() });

		result.current.mutate(validInput);

		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true);
		});

		expect(result.current.data).toEqual({ user: mockUser, session: mockSession });
		expect(mockSignUp).toHaveBeenCalledWith({
			email: 'test@example.com',
			password: 'securepass',
			options: {
				data: {
					display_name: 'Alice',
				},
			},
		});
	});

	it('throws mapped error for duplicate email', async () => {
		mockSignUp.mockResolvedValue({
			data: { user: null, session: null },
			error: new AuthError('User already registered', 422, 'user_already_exists'),
		});

		const { result } = renderHook(() => useRegister(), { wrapper: createWrapper() });

		result.current.mutate(validInput);

		await waitFor(() => {
			expect(result.current.isError).toBe(true);
		});

		expect(result.current.error?.message).toBe('An account with this email already exists.');
	});

	it('throws generic message for network errors', async () => {
		mockSignUp.mockResolvedValue({
			data: { user: null, session: null },
			error: new AuthError('Failed to fetch'),
		});

		const { result } = renderHook(() => useRegister(), { wrapper: createWrapper() });

		result.current.mutate(validInput);

		await waitFor(() => {
			expect(result.current.isError).toBe(true);
		});

		expect(result.current.error?.message).toBe('Something went wrong. Please try again.');
	});

	it('throws error when user is null (email confirmation flow)', async () => {
		mockSignUp.mockResolvedValue({
			data: { user: null, session: null },
			error: null,
		});

		const { result } = renderHook(() => useRegister(), { wrapper: createWrapper() });

		result.current.mutate(validInput);

		await waitFor(() => {
			expect(result.current.isError).toBe(true);
		});

		expect(result.current.error?.message).toBe('Registration failed. Please try again.');
	});
});
