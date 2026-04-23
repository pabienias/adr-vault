'use client';

import type { ReactNode } from 'react';
import { Toaster as SonnerToaster } from 'sonner';

export function Toaster(): ReactNode {
	return (
		<SonnerToaster
			position="bottom-right"
			duration={3200}
			gap={8}
			offset={20}
			toastOptions={{
				classNames: {
					toast:
						'!rounded-[var(--radius-sm)] !shadow-[var(--shadow-lg)] !text-[13px] !py-[10px] !px-[14px] !min-w-[220px] !max-w-[360px] !border-transparent',
					success: '!bg-[#0f172a] !text-white',
					error: '!bg-[#7f1d1d] !text-white',
					info: '!bg-[#0f172a] !text-white',
					icon: 'opacity-80',
				},
			}}
		/>
	);
}
