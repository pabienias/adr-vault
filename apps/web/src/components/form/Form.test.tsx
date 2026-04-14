import { zodResolver } from '@hookform/resolvers/zod';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { Form } from './Form.js';

const schema = z.object({
	email: z.string().email('Invalid email'),
});

type FormValues = z.infer<typeof schema>;

function TestForm({ onSubmit }: { onSubmit: (values: FormValues) => void }): React.ReactNode {
	const form = useForm<FormValues>({
		resolver: zodResolver(schema),
		defaultValues: { email: '' },
	});

	return (
		<Form form={form} onSubmit={onSubmit}>
			<input {...form.register('email')} placeholder="Email" />
			<button type="submit">Submit</button>
		</Form>
	);
}

describe('Form', () => {
	it('renders a form element with children', () => {
		render(<TestForm onSubmit={() => {}} />);

		expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
		expect(screen.getByText('Submit')).toBeInTheDocument();
	});

	it('calls onSubmit with validated data', async () => {
		const user = userEvent.setup();
		const handleSubmit = vi.fn();

		render(<TestForm onSubmit={handleSubmit} />);

		await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
		await user.click(screen.getByText('Submit'));

		await waitFor(() => {
			expect(handleSubmit).toHaveBeenCalledOnce();
		});

		expect(handleSubmit.mock.calls[0]?.[0]).toEqual({ email: 'test@example.com' });
	});

	it('does not call onSubmit when validation fails', async () => {
		const user = userEvent.setup();
		const handleSubmit = vi.fn();

		render(<TestForm onSubmit={handleSubmit} />);

		await user.type(screen.getByPlaceholderText('Email'), 'not-an-email');
		await user.click(screen.getByText('Submit'));

		await waitFor(() => {
			expect(handleSubmit).not.toHaveBeenCalled();
		});
	});
});
