import {
	MAX_DISPLAY_NAME_LENGTH,
	MAX_EMAIL_LENGTH,
	MAX_PASSWORD_LENGTH,
	MIN_PASSWORD_LENGTH,
} from '@adr-vault/core';
import { z } from 'zod';

export const registrationSchema = z.object({
	email: z
		.email('Please enter a valid email address')
		.min(1, 'Email is required')
		.max(MAX_EMAIL_LENGTH, `Email must be at most ${MAX_EMAIL_LENGTH} characters`),
	password: z
		.string()
		.min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
		.max(MAX_PASSWORD_LENGTH, `Password must be at most ${MAX_PASSWORD_LENGTH} characters`),
	displayName: z
		.string()
		.max(
			MAX_DISPLAY_NAME_LENGTH,
			`Display name must be at most ${MAX_DISPLAY_NAME_LENGTH} characters`,
		)
		.optional()
		.or(z.literal('')),
});

export type RegistrationFormValues = z.infer<typeof registrationSchema>;

export const registrationFormSchema = registrationSchema
	.extend({
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword'],
	});

export type RegistrationFormData = z.infer<typeof registrationFormSchema>;
