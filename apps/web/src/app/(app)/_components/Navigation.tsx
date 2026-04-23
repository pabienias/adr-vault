import { FilePlus, List, Sparkles } from 'lucide-react';
import Link from 'next/link';
import type { ComponentType, ReactNode, SVGProps } from 'react';

type NavItemData = {
	href: string;
	label: string;
	icon: ComponentType<SVGProps<SVGSVGElement>>;
};

type NavGroupData = {
	id: string;
	label: string | null;
	items: NavItemData[];
};

const NAV_GROUPS: NavGroupData[] = [
	{
		id: 'nav-group-primary',
		label: null,
		items: [{ href: '#', label: 'ADR List', icon: List }],
	},
	{
		id: 'nav-group-create',
		label: 'Create',
		items: [
			{ href: '#', label: 'Create Manually', icon: FilePlus },
			{ href: '#', label: 'Create via AI', icon: Sparkles },
		],
	},
];

type NavItemProps = {
	href: string;
	icon: ComponentType<SVGProps<SVGSVGElement>>;
	children: ReactNode;
};

function NavItem({ href, icon: Icon, children }: NavItemProps): ReactNode {
	return (
		<Link
			href={href}
			className="flex items-center gap-[10px] rounded-[6px] px-[10px] py-[7px] text-[13.5px] font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
		>
			<Icon aria-hidden className="h-4 w-4 opacity-85" />
			<span>{children}</span>
		</Link>
	);
}

export function Navigation(): ReactNode {
	return (
		<nav aria-label="Primary" className="flex flex-col">
			{NAV_GROUPS.map((group) => (
				<div key={group.id} className="mt-3 flex flex-col gap-[2px] first:mt-0">
					{group.label && (
						<div
							id={group.id}
							className="px-[10px] pt-[6px] pb-1 text-[10.5px] font-medium uppercase tracking-[0.08em] text-[var(--text-faint)]"
						>
							{group.label}
						</div>
					)}
					<ul
						aria-labelledby={group.label ? group.id : undefined}
						className="flex flex-col gap-[2px]"
					>
						{group.items.map((item) => (
							<li key={item.label}>
								<NavItem href={item.href} icon={item.icon}>
									{item.label}
								</NavItem>
							</li>
						))}
					</ul>
				</div>
			))}
		</nav>
	);
}
