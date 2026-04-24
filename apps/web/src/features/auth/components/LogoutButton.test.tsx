import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { mockReplace, mockToastError, mutateMock, useLogoutMock } = vi.hoisted(() => ({
	mockReplace: vi.fn(),
	mockToastError: vi.fn(),
	mutateMock: vi.fn(),
	useLogoutMock: vi.fn(),
}));

vi.mock('next/navigation', () => ({
	useRouter: (): unknown => ({ replace: mockReplace }),
}));

vi.mock('@/lib/toast', () => ({
	toast: {
		success: vi.fn(),
		error: mockToastError,
		info: vi.fn(),
	},
}));

vi.mock('../hooks/use-logout', () => ({
	useLogout: useLogoutMock,
}));

import { LogoutButton } from './LogoutButton';

type MutationStateOverrides = {
	isPending?: boolean;
};

function mockUseLogout({ isPending = false }: MutationStateOverrides = {}): void {
	useLogoutMock.mockReturnValue({
		mutate: mutateMock,
		isPending,
	});
}

function renderButton(): ReactNode {
	return render(<LogoutButton />) as unknown as ReactNode;
}

describe('LogoutButton', () => {
	beforeEach(() => {
		mockReplace.mockReset();
		mockToastError.mockReset();
		mutateMock.mockReset();
		useLogoutMock.mockReset();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it('redirects to /login on successful logout and shows no toast', async () => {
		mutateMock.mockImplementation((_vars, options) => {
			options?.onSuccess?.();
		});
		mockUseLogout();

		renderButton();
		await userEvent.click(screen.getByRole('button', { name: /log out/i }));

		await waitFor(() => {
			expect(mockReplace).toHaveBeenCalledWith('/login');
		});
		expect(mockToastError).not.toHaveBeenCalled();
	});

	it('shows a toast error and does not redirect on logout failure', async () => {
		mutateMock.mockImplementation((_vars, options) => {
			options?.onError?.(new Error('Something went wrong. Please try again.'));
		});
		mockUseLogout();

		renderButton();
		await userEvent.click(screen.getByRole('button', { name: /log out/i }));

		await waitFor(() => {
			expect(mockToastError).toHaveBeenCalledWith('Something went wrong. Please try again.');
		});
		expect(mockReplace).not.toHaveBeenCalled();
	});

	it('disables the button while the mutation is pending', () => {
		mockUseLogout({ isPending: true });

		renderButton();
		const button = screen.getByRole('button', { name: /log out/i });

		expect((button as HTMLButtonElement).disabled).toBe(true);
	});
});
