import type { AuthResponse } from '@supabase/supabase-js';
import type { UseMutationResult } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import { createClient } from '@/lib/supabase/client';
import type { RegistrationFormValues } from '../schemas/registration-schema';
import { mapAuthError } from '../utils/map-auth-error';

async function registerUser(values: RegistrationFormValues): Promise<AuthResponse['data']> {
	const supabase = createClient();

	const { data, error } = await supabase.auth.signUp({
		email: values.email,
		password: values.password,
		options: {
			data: {
				display_name: values.displayName,
			},
		},
	});

	if (error) {
		throw new Error(mapAuthError(error, 'registration'));
	}

	if (!data.user) {
		throw new Error('Registration failed. Please try again.');
	}

	return data;
}

export function useRegister(): UseMutationResult<
	AuthResponse['data'],
	Error,
	RegistrationFormValues
> {
	return useMutation({
		mutationFn: registerUser,
	});
}
