import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RegistrationForm } from './RegistrationForm.js';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
	useRouter: (): { push: typeof mockPush } => ({ push: mockPush }),
}));

const mockMutateAsync = vi.fn();
const mockUseRegister = vi.fn();

vi.mock('../hooks/use-register', () => ({
	useRegister: (...args: unknown[]): unknown => mockUseRegister(...args),
}));

function defaultMutation(): {
	mutateAsync: typeof mockMutateAsync;
	isPending: boolean;
	error: null;
} {
	return {
		mutateAsync: mockMutateAsync,
		isPending: false,
		error: null,
	};
}

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

function getInput(name: string): HTMLInputElement {
	const input = document.querySelector<HTMLInputElement>(`input[name="${name}"]`);
	if (!input) {
		throw new Error(`Input with name "${name}" not found`);
	}
	return input;
}

describe('RegistrationForm', () => {
	beforeEach(() => {
		mockMutateAsync.mockReset();
		mockPush.mockReset();
		mockUseRegister.mockReturnValue(defaultMutation());
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('renders all fields and submit button', () => {
		render(<RegistrationForm />, { wrapper: createWrapper() });

		expect(getInput('email')).toBeInTheDocument();
		expect(getInput('password')).toBeInTheDocument();
		expect(getInput('confirmPassword')).toBeInTheDocument();
		expect(getInput('displayName')).toBeInTheDocument();
		expect(screen.getByText('Email')).toBeInTheDocument();
		expect(screen.getByText('Password')).toBeInTheDocument();
		expect(screen.getByText('Confirm password')).toBeInTheDocument();
		expect(screen.getByText('Display name')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Create account' })).toBeInTheDocument();
	});

	it('shows validation errors on empty submit', async () => {
		const user = userEvent.setup();
		render(<RegistrationForm />, { wrapper: createWrapper() });

		await user.click(screen.getByRole('button', { name: 'Create account' }));

		await waitFor(() => {
			expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
		});

		expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
	});

	it('shows loading state during submission', () => {
		mockUseRegister.mockReturnValue({
			...defaultMutation(),
			isPending: true,
		});

		render(<RegistrationForm />, { wrapper: createWrapper() });

		const button = screen.getByRole('button', { name: 'Creating account…' });
		expect(button).toBeInTheDocument();
		expect(button).toBeDisabled();
	});

	it('displays server error from mutation', () => {
		mockUseRegister.mockReturnValue({
			...defaultMutation(),
			error: new Error('An account with this email already exists.'),
		});

		render(<RegistrationForm />, { wrapper: createWrapper() });

		expect(screen.getByText('An account with this email already exists.')).toBeInTheDocument();
	});

	it('shows error when passwords do not match', async () => {
		const user = userEvent.setup();
		render(<RegistrationForm />, { wrapper: createWrapper() });

		await user.type(getInput('email'), 'test@example.com');
		await user.type(getInput('password'), 'securepass');
		await user.type(getInput('confirmPassword'), 'differentpass');
		await user.type(getInput('displayName'), 'Alice');
		await user.click(screen.getByRole('button', { name: 'Create account' }));

		await waitFor(() => {
			expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
		});

		expect(mockMutateAsync).not.toHaveBeenCalled();
	});

	it('calls mutateAsync and redirects on success', async () => {
		mockMutateAsync.mockResolvedValue({});
		const user = userEvent.setup();

		render(<RegistrationForm />, { wrapper: createWrapper() });

		await user.type(getInput('email'), 'test@example.com');
		await user.type(getInput('password'), 'securepass');
		await user.type(getInput('confirmPassword'), 'securepass');
		await user.type(getInput('displayName'), 'Alice');
		await user.click(screen.getByRole('button', { name: 'Create account' }));

		await waitFor(() => {
			expect(mockMutateAsync).toHaveBeenCalledOnce();
		});

		expect(mockMutateAsync).toHaveBeenCalledWith({
			email: 'test@example.com',
			password: 'securepass',
			displayName: 'Alice',
		});

		await waitFor(() => {
			expect(mockPush).toHaveBeenCalledWith('/');
		});
	});
});
