import { act, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Toaster } from '@/components/ui/sonner';
import { toast } from './toast';

describe('toast helper', () => {
	it('renders a success toast with the given message', async () => {
		render(<Toaster />);

		act(() => {
			toast.success('Saved successfully');
		});

		await waitFor(() => {
			expect(screen.getByText('Saved successfully')).toBeDefined();
		});
	});

	it('renders an error toast with the given message', async () => {
		render(<Toaster />);

		act(() => {
			toast.error('Something broke');
		});

		await waitFor(() => {
			expect(screen.getByText('Something broke')).toBeDefined();
		});
	});

	it('renders an info toast with the given message', async () => {
		render(<Toaster />);

		act(() => {
			toast.info('Heads up');
		});

		await waitFor(() => {
			expect(screen.getByText('Heads up')).toBeDefined();
		});
	});
});
