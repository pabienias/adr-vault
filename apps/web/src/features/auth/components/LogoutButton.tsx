'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

import { toast } from '@/lib/toast';
import { useLogout } from '../hooks/use-logout';

export function LogoutButton(): ReactNode {
	const mutation = useLogout();
	const router = useRouter();

	function handleClick(): void {
		mutation.mutate(undefined, {
			onSuccess: () => {
				router.replace('/login');
			},
			onError: (error) => {
				toast.error(error.message);
			},
		});
	}

	return (
		<button
			type="button"
			onClick={handleClick}
			disabled={mutation.isPending}
			aria-label="Log out"
			className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-[var(--radius-sm)] opacity-60 transition-opacity hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-40"
		>
			<LogOut aria-hidden className="h-[14px] w-[14px]" />
		</button>
	);
}
