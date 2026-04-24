import type { ReactNode } from 'react';

import { LogoutButton } from '@/features/auth/components/LogoutButton';

export type SidebarFooterProps = {
	displayName: string | null;
	email: string;
};

export function SidebarFooter({ displayName, email }: SidebarFooterProps): ReactNode {
	const primaryLine = displayName ?? email;
	const secondaryLine = displayName !== null ? email : null;

	return (
		<div className="mt-auto flex items-center gap-2 border-t border-[var(--border)] px-[10px] pt-3">
			<div className="flex min-w-0 flex-1 flex-col">
				<span className="truncate text-[13px] font-medium text-[var(--text)]">{primaryLine}</span>
				{secondaryLine && (
					<span className="truncate text-[11px] text-[var(--text-faint)]">{secondaryLine}</span>
				)}
			</div>
			<LogoutButton />
		</div>
	);
}
