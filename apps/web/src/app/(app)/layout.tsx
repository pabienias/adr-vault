import type { ReactNode } from 'react';
import { getCurrentUser } from '@/features/auth/server/get-current-user';
import { Sidebar } from './_components/Sidebar';

export default async function AppLayout({
	children,
}: Readonly<{
	children: ReactNode;
}>): Promise<ReactNode> {
	const { displayName, email } = await getCurrentUser();

	return (
		<div className="flex flex-1">
			<Sidebar displayName={displayName} email={email} />
			<div className="flex flex-1 flex-col">{children}</div>
		</div>
	);
}
