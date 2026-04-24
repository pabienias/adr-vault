import type { AuthError } from '@supabase/supabase-js';

const ERROR_MESSAGES = new Map<string, string>([
	['user_already_exists', 'An account with this email already exists.'],
	['email_exists', 'An account with this email already exists.'],
	['weak_password', 'Password does not meet the requirements.'],
	['validation_failed', 'Please check your input and try again.'],
	['over_request_rate_limit', 'Too many attempts. Please try again later.'],
	['over_email_send_rate_limit', 'Too many attempts. Please try again later.'],
	['signup_disabled', 'Registration is currently disabled.'],
	['invalid_credentials', 'Invalid email or password.'],
	['email_not_confirmed', 'Please verify your email address before signing in.'],
]);

const DUPLICATE_EMAIL_MESSAGE = 'An account with this email already exists.';
const NETWORK_ERROR_MESSAGE = 'Something went wrong. Please try again.';

const GENERIC_MESSAGES: Record<AuthErrorContext, string> = {
	registration: 'Registration failed. Please try again.',
	login: 'Login failed. Please try again.',
	logout: 'Logout failed. Please try again.',
};

export type AuthErrorContext = 'registration' | 'login' | 'logout';

export function mapAuthError(error: AuthError, context: AuthErrorContext): string {
	if (error.code) {
		const mapped = ERROR_MESSAGES.get(error.code);
		if (mapped) {
			return mapped;
		}
	}

	if (error.message.includes('User already registered')) {
		return DUPLICATE_EMAIL_MESSAGE;
	}

	if (!error.status) {
		return NETWORK_ERROR_MESSAGE;
	}

	return GENERIC_MESSAGES[context];
}
