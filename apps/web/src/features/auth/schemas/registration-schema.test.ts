import { describe, expect, it } from 'vitest';
import { registrationSchema } from './registration-schema.js';

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
