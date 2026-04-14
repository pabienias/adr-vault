import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LoginForm } from './LoginForm.js';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
	useRouter: (): { push: typeof mockPush } => ({ push: mockPush }),
}));

const mockMutateAsync = vi.fn();
const mockUseLogin = vi.fn();

vi.mock('../hooks/use-login', () => ({
	useLogin: (...args: unknown[]): unknown => mockUseLogin(...args),
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

describe('LoginForm', () => {
	beforeEach(() => {
		mockMutateAsync.mockReset();
		mockPush.mockReset();
		mockUseLogin.mockReturnValue(defaultMutation());
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('renders email and password fields and submit button', () => {
		render(<LoginForm />, { wrapper: createWrapper() });

		expect(getInput('email')).toBeInTheDocument();
		expect(getInput('password')).toBeInTheDocument();
		expect(screen.getByText('Email')).toBeInTheDocument();
		expect(screen.getByText('Password')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
	});

	it('shows validation errors on empty submit', async () => {
		const user = userEvent.setup();
		render(<LoginForm />, { wrapper: createWrapper() });

		await user.click(screen.getByRole('button', { name: 'Sign in' }));

		await waitFor(() => {
			expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
		});

		expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
	});

	it('shows loading state during submission', () => {
		mockUseLogin.mockReturnValue({
			...defaultMutation(),
			isPending: true,
		});

		render(<LoginForm />, { wrapper: createWrapper() });

		const button = screen.getByRole('button', { name: 'Signing in…' });
		expect(button).toBeInTheDocument();
		expect(button).toBeDisabled();
	});

	it('displays server error from mutation', () => {
		mockUseLogin.mockReturnValue({
			...defaultMutation(),
			error: new Error('Invalid email or password.'),
		});

		render(<LoginForm />, { wrapper: createWrapper() });

		expect(screen.getByRole('alert')).toHaveTextContent('Invalid email or password.');
	});

	it('calls mutateAsync and redirects on success', async () => {
		mockMutateAsync.mockResolvedValue({});
		const user = userEvent.setup();

		render(<LoginForm />, { wrapper: createWrapper() });

		await user.type(getInput('email'), 'test@example.com');
		await user.type(getInput('password'), 'securepass');
		await user.click(screen.getByRole('button', { name: 'Sign in' }));

		await waitFor(() => {
			expect(mockMutateAsync).toHaveBeenCalledOnce();
		});

		expect(mockMutateAsync).toHaveBeenCalledWith({
			email: 'test@example.com',
			password: 'securepass',
		});

		await waitFor(() => {
			expect(mockPush).toHaveBeenCalledWith('/');
		});
	});
});
