import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Sidebar } from './Sidebar';

describe('Sidebar', () => {
	it('renders a primary navigation landmark', () => {
		render(<Sidebar displayName="Alice" email="alice@example.com" />);

		const nav = screen.getByRole('navigation', { name: 'Primary' });

		expect(nav).toBeDefined();
	});

	it('renders all three nav items', () => {
		render(<Sidebar displayName="Alice" email="alice@example.com" />);

		expect(screen.getByRole('link', { name: /adr list/i })).toBeDefined();
		expect(screen.getByRole('link', { name: /create manually/i })).toBeDefined();
		expect(screen.getByRole('link', { name: /create via ai/i })).toBeDefined();
		expect(screen.getAllByRole('link')).toHaveLength(3);
	});

	it('places Create Manually and Create via AI inside the "Create" list', () => {
		render(<Sidebar displayName="Alice" email="alice@example.com" />);

		const createList = screen.getByRole('list', { name: 'Create' });

		expect(within(createList).getByRole('link', { name: /create manually/i })).toBeDefined();
		expect(within(createList).getByRole('link', { name: /create via ai/i })).toBeDefined();
		expect(within(createList).queryByRole('link', { name: /adr list/i })).toBeNull();
	});

	it('uses href="#" placeholders on all nav items', () => {
		render(<Sidebar displayName="Alice" email="alice@example.com" />);

		for (const link of screen.getAllByRole('link')) {
			expect(link.getAttribute('href')).toBe('#');
		}
	});

	it('renders the brand header', () => {
		render(<Sidebar displayName="Alice" email="alice@example.com" />);

		expect(screen.getByText('ADR Vault')).toBeDefined();
	});

	it('forwards identity props to the footer', () => {
		render(<Sidebar displayName="Alice" email="alice@example.com" />);

		expect(screen.getByText('Alice')).toBeDefined();
		expect(screen.getByText('alice@example.com')).toBeDefined();
	});
});
