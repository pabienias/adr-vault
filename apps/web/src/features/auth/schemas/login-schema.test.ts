import { describe, expect, it } from 'vitest';
import { loginSchema } from './login-schema.js';

describe('loginSchema', () => {
	it('accepts valid input', () => {
		const result = loginSchema.safeParse({
			email: 'test@example.com',
			password: 'securepass',
		});

		expect(result.success).toBe(true);
	});

	it('rejects missing email', () => {
		const result = loginSchema.safeParse({
			password: 'securepass',
		});

		expect(result.success).toBe(false);
	});

	it('rejects invalid email format', () => {
		const result = loginSchema.safeParse({
			email: 'not-an-email',
			password: 'securepass',
		});

		expect(result.success).toBe(false);
	});

	it('rejects email exceeding max length', () => {
		const result = loginSchema.safeParse({
			email: `${'a'.repeat(250)}@test.com`,
			password: 'securepass',
		});

		expect(result.success).toBe(false);
	});

	it('rejects password shorter than minimum', () => {
		const result = loginSchema.safeParse({
			email: 'test@example.com',
			password: 'short',
		});

		expect(result.success).toBe(false);
	});

	it('rejects password longer than maximum', () => {
		const result = loginSchema.safeParse({
			email: 'test@example.com',
			password: 'a'.repeat(73),
		});

		expect(result.success).toBe(false);
	});

	it('rejects missing password', () => {
		const result = loginSchema.safeParse({
			email: 'test@example.com',
		});

		expect(result.success).toBe(false);
	});
});
