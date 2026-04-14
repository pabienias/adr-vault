import type { AuthResponse } from '@supabase/supabase-js';
import type { UseMutationResult } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import { createClient } from '@/lib/supabase/client';
import type { LoginFormValues } from '../schemas/login-schema';
import { mapAuthError } from '../utils/map-auth-error';

async function loginUser(values: LoginFormValues): Promise<AuthResponse['data']> {
	const supabase = createClient();

	const { data, error } = await supabase.auth.signInWithPassword({
		email: values.email,
		password: values.password,
	});

	if (error) {
		throw new Error(mapAuthError(error, 'login'));
	}

	if (!data.user) {
		throw new Error('Login failed. Please try again.');
	}

	return data;
}

export function useLogin(): UseMutationResult<AuthResponse['data'], Error, LoginFormValues> {
	return useMutation({
		mutationFn: loginUser,
	});
}
