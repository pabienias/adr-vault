import { useQueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { QueryProvider } from './QueryProvider.js';

function TestChild(): React.ReactNode {
	const queryClient = useQueryClient();
	return <div data-testid="child">has-client-{queryClient ? 'yes' : 'no'}</div>;
}

describe('QueryProvider', () => {
	it('renders children', () => {
		render(
			<QueryProvider>
				<p>Hello</p>
			</QueryProvider>,
		);

		expect(screen.getByText('Hello')).toBeInTheDocument();
	});

	it('provides a QueryClient to children', () => {
		render(
			<QueryProvider>
				<TestChild />
			</QueryProvider>,
		);

		expect(screen.getByTestId('child')).toHaveTextContent('has-client-yes');
	});
});
