import { AuthError } from '@supabase/supabase-js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useLogout } from './use-logout.js';

const mockSignOut = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
	createClient: (): unknown => ({
		auth: {
			signOut: mockSignOut,
		},
	}),
}));

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

describe('useLogout', () => {
	beforeEach(() => {
		mockSignOut.mockReset();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('resolves on success', async () => {
		mockSignOut.mockResolvedValue({ error: null });

		const { result } = renderHook(() => useLogout(), { wrapper: createWrapper() });

		result.current.mutate();

		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true);
		});

		expect(mockSignOut).toHaveBeenCalledOnce();
	});

	it('throws generic message for network errors', async () => {
		mockSignOut.mockResolvedValue({
			error: new AuthError('Failed to fetch'),
		});

		const { result } = renderHook(() => useLogout(), { wrapper: createWrapper() });

		result.current.mutate();

		await waitFor(() => {
			expect(result.current.isError).toBe(true);
		});

		expect(result.current.error?.message).toBe('Something went wrong. Please try again.');
	});

	it('throws logout generic message for unknown errors with status', async () => {
		mockSignOut.mockResolvedValue({
			error: new AuthError('Unexpected', 500),
		});

		const { result } = renderHook(() => useLogout(), { wrapper: createWrapper() });

		result.current.mutate();

		await waitFor(() => {
			expect(result.current.isError).toBe(true);
		});

		expect(result.current.error?.message).toBe('Logout failed. Please try again.');
	});
});
