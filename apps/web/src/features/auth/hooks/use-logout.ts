import type { UseMutationResult } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import { createClient } from '@/lib/supabase/client';
import { mapAuthError } from '../utils/map-auth-error';

async function logoutUser(): Promise<void> {
	const supabase = createClient();

	const { error } = await supabase.auth.signOut();

	if (error) {
		throw new Error(mapAuthError(error, 'logout'));
	}
}

export function useLogout(): UseMutationResult<void, Error, void> {
	return useMutation({
		mutationFn: logoutUser,
	});
}
