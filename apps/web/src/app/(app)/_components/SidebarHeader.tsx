import type { ReactNode } from 'react';

export function SidebarHeader(): ReactNode {
	return (
		<div className="flex items-center gap-[10px] px-[10px] pt-[6px] pb-[18px]">
			<span
				aria-hidden
				className="mono flex h-[26px] w-[26px] items-center justify-center rounded-[7px] text-[13px] font-bold text-[var(--accent-contrast)]"
				style={{
					background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))',
				}}
			>
				AV
			</span>
			<span className="text-[15px] font-semibold tracking-[-0.01em] text-[var(--text)]">
				ADR Vault
			</span>
		</div>
	);
}
