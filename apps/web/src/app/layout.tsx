import type { Metadata } from 'next';
import { Inter_Tight, JetBrains_Mono } from 'next/font/google';
import type { ReactNode } from 'react';
import { QueryProvider } from '@/providers/QueryProvider';
import './globals.css';

const interTight = Inter_Tight({
	variable: '--font-inter-tight',
	subsets: ['latin'],
	weight: ['400', '500', '600', '700'],
});

const jetbrainsMono = JetBrains_Mono({
	variable: '--font-jetbrains-mono',
	subsets: ['latin'],
	weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
	title: 'ADR Vault',
	description: 'Create, manage, and query Architectural Decision Records',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: ReactNode;
}>): ReactNode {
	return (
		<html
			lang="en"
			className={`${interTight.variable} ${jetbrainsMono.variable} h-full antialiased`}
		>
			<body className="min-h-full flex flex-col">
				<QueryProvider>{children}</QueryProvider>
			</body>
		</html>
	);
}
