import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import RegisterPage from './page';

vi.mock('@/features/auth/components/RegistrationForm', () => ({
	RegistrationForm: (): ReactNode => <div data-testid="registration-form" />,
}));

describe('RegisterPage', () => {
	it('renders heading', () => {
		render(<RegisterPage />);

		expect(screen.getByText('Create your account')).toBeDefined();
	});

	it('renders the registration form', () => {
		render(<RegisterPage />);

		expect(screen.getByTestId('registration-form')).toBeDefined();
	});

	it('renders login link', () => {
		render(<RegisterPage />);

		const link = screen.getByRole('link', { name: /sign in/i });

		expect(link).toBeDefined();
		expect(link.getAttribute('href')).toBe('/login');
	});
});
