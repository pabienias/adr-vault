'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/form/Form';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useLogin } from '../hooks/use-login';
import type { LoginFormValues } from '../schemas/login-schema';
import { loginSchema } from '../schemas/login-schema';

export function LoginForm(): ReactNode {
	const form = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: '',
			password: '',
		},
	});

	const mutation = useLogin();
	const router = useRouter();

	const { errors } = form.formState;

	async function onSubmit(values: LoginFormValues): Promise<void> {
		try {
			await mutation.mutateAsync(values);
			router.push('/');
		} catch {
			// Errors are handled by React Query mutation state
		}
	}

	return (
		<Form form={form} onSubmit={onSubmit} className="flex flex-col gap-4">
			{mutation.error && (
				<div
					role="alert"
					className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
				>
					{mutation.error.message}
				</div>
			)}

			<Field data-invalid={!!errors.email}>
				<FieldLabel>Email</FieldLabel>
				<Input type="email" {...form.register('email')} aria-invalid={!!errors.email} />
				<FieldError>{errors.email?.message}</FieldError>
			</Field>

			<Field data-invalid={!!errors.password}>
				<FieldLabel>Password</FieldLabel>
				<Input type="password" {...form.register('password')} aria-invalid={!!errors.password} />
				<FieldError>{errors.password?.message}</FieldError>
			</Field>

			<Button type="submit" disabled={mutation.isPending}>
				{mutation.isPending ? 'Signing in…' : 'Sign in'}
			</Button>
		</Form>
	);
}
