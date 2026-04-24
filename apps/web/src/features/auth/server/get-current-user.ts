import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';

export type CurrentUser = {
	id: string;
	email: string;
	displayName: string | null;
};

export const getCurrentUser = cache(async (): Promise<CurrentUser> => {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		// Middleware guards authenticated routes, so callers do not reach here
		// without a valid session. The throw narrows the return type and makes
		// the contract explicit to reviewers.
		throw new Error('getCurrentUser called without an authenticated user');
	}

	const rawDisplayName = user.user_metadata?.display_name;
	const displayName =
		typeof rawDisplayName === 'string' && rawDisplayName.trim() !== '' ? rawDisplayName : null;

	return {
		id: user.id,
		email: user.email ?? '',
		displayName,
	};
});
