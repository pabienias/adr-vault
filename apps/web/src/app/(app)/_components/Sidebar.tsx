import type { ReactNode } from 'react';
import { Navigation } from './Navigation';
import { SidebarFooter, type SidebarFooterProps } from './SidebarFooter';
import { SidebarHeader } from './SidebarHeader';

export type SidebarProps = SidebarFooterProps;

export function Sidebar({ displayName, email }: SidebarProps): ReactNode {
	return (
		<div className="sticky top-0 flex h-screen w-[240px] flex-shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] px-3 py-4">
			<SidebarHeader />
			<Navigation />
			<SidebarFooter displayName={displayName} email={email} />
		</div>
	);
}
