import { AuthError } from '@supabase/supabase-js';
import { describe, expect, it } from 'vitest';
import { mapAuthError } from './map-auth-error.js';

function makeAuthError(message: string, status?: number, code?: string): AuthError {
	return new AuthError(message, status, code);
}

describe('mapAuthError', () => {
	it('maps user_already_exists code', () => {
		const error = makeAuthError('User already registered', 422, 'user_already_exists');
		expect(mapAuthError(error)).toBe('An account with this email already exists.');
	});

	it('maps email_exists code', () => {
		const error = makeAuthError('Email already in use', 422, 'email_exists');
		expect(mapAuthError(error)).toBe('An account with this email already exists.');
	});

	it('maps weak_password code', () => {
		const error = makeAuthError('Password too weak', 422, 'weak_password');
		expect(mapAuthError(error)).toBe('Password does not meet the requirements.');
	});

	it('maps over_request_rate_limit code', () => {
		const error = makeAuthError('Rate limit exceeded', 429, 'over_request_rate_limit');
		expect(mapAuthError(error)).toBe('Too many attempts. Please try again later.');
	});

	it('maps signup_disabled code', () => {
		const error = makeAuthError('Signups not allowed', 403, 'signup_disabled');
		expect(mapAuthError(error)).toBe('Registration is currently disabled.');
	});

	it('falls back to message matching for "User already registered"', () => {
		const error = makeAuthError('User already registered', 422);
		expect(mapAuthError(error)).toBe('An account with this email already exists.');
	});

	it('returns network error message when no status', () => {
		const error = makeAuthError('Failed to fetch');
		expect(mapAuthError(error)).toBe('Something went wrong. Please try again.');
	});

	it('returns generic message for unknown errors with status', () => {
		const error = makeAuthError('Some unknown error', 500);
		expect(mapAuthError(error)).toBe('Registration failed. Please try again.');
	});
});
