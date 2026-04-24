import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/features/auth/components/LogoutButton', () => ({
	LogoutButton: (): React.ReactNode => (
		<button type="button" aria-label="Log out">
			logout
		</button>
	),
}));

import { SidebarFooter } from './SidebarFooter';

describe('SidebarFooter', () => {
	it('renders display name as primary line and email as secondary when display name is present', () => {
		render(<SidebarFooter displayName="Alice" email="alice@example.com" />);

		expect(screen.getByText('Alice')).toBeDefined();
		expect(screen.getByText('alice@example.com')).toBeDefined();
	});

	it('renders email as primary line when display name is null — no secondary line', () => {
		render(<SidebarFooter displayName={null} email="alice@example.com" />);

		const emailNodes = screen.getAllByText('alice@example.com');

		expect(emailNodes).toHaveLength(1);
	});

	it('renders a logout control in the footer', () => {
		render(<SidebarFooter displayName="Alice" email="alice@example.com" />);

		expect(screen.getByRole('button', { name: /log out/i })).toBeDefined();
	});
});
