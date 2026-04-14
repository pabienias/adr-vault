import { describe, expect, it } from 'vitest';
import { registrationFormSchema, registrationSchema } from './registration-schema.js';

describe('registrationSchema', () => {
	it('accepts valid input', () => {
		const result = registrationSchema.safeParse({
			email: 'test@example.com',
			password: 'securepass',
			displayName: 'Alice',
		});

		expect(result.success).toBe(true);
	});

	it('accepts valid input without display name', () => {
		const result = registrationSchema.safeParse({
			email: 'test@example.com',
			password: 'securepass',
		});

		expect(result.success).toBe(true);
	});

	it('accepts empty string as display name', () => {
		const result = registrationSchema.safeParse({
			email: 'test@example.com',
			password: 'securepass',
			displayName: '',
		});

		expect(result.success).toBe(true);
	});

	it('rejects missing email', () => {
		const result = registrationSchema.safeParse({
			password: 'securepass',
		});

		expect(result.success).toBe(false);
	});

	it('rejects invalid email format', () => {
		const result = registrationSchema.safeParse({
			email: 'not-an-email',
			password: 'securepass',
		});

		expect(result.success).toBe(false);
	});

	it('rejects password shorter than minimum', () => {
		const result = registrationSchema.safeParse({
			email: 'test@example.com',
			password: 'short',
		});

		expect(result.success).toBe(false);
	});

	it('rejects password longer than maximum', () => {
		const result = registrationSchema.safeParse({
			email: 'test@example.com',
			password: 'a'.repeat(73),
		});

		expect(result.success).toBe(false);
	});

	it('rejects display name longer than maximum', () => {
		const result = registrationSchema.safeParse({
			email: 'test@example.com',
			password: 'securepass',
			displayName: 'a'.repeat(101),
		});

		expect(result.success).toBe(false);
	});
});

describe('registrationFormSchema', () => {
	const validInput = {
		email: 'test@example.com',
		password: 'securepass',
		confirmPassword: 'securepass',
		displayName: 'Alice',
	};

	it('accepts matching passwords', () => {
		const result = registrationFormSchema.safeParse(validInput);

		expect(result.success).toBe(true);
	});

	it('rejects mismatched passwords', () => {
		const result = registrationFormSchema.safeParse({
			...validInput,
			confirmPassword: 'differentpass',
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			const confirmError = result.error.issues.find((issue) =>
				issue.path.includes('confirmPassword'),
			);
			expect(confirmError?.message).toBe('Passwords do not match');
		}
	});

	it('rejects empty confirm password', () => {
		const result = registrationFormSchema.safeParse({
			...validInput,
			confirmPassword: '',
		});

		expect(result.success).toBe(false);
	});

	it('still validates base schema rules', () => {
		const result = registrationFormSchema.safeParse({
			...validInput,
			email: 'not-an-email',
		});

		expect(result.success).toBe(false);
	});
});
