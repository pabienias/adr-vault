import { MAX_EMAIL_LENGTH, MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from '@adr-vault/core';
import { z } from 'zod';

export const loginSchema = z.object({
	email: z
		.email('Please enter a valid email address')
		.min(1, 'Email is required')
		.max(MAX_EMAIL_LENGTH, `Email must be at most ${MAX_EMAIL_LENGTH} characters`),
	password: z
		.string()
		.min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
		.max(MAX_PASSWORD_LENGTH, `Password must be at most ${MAX_PASSWORD_LENGTH} characters`),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
