import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from '@/features/auth/components/LoginForm';

export const metadata: Metadata = {
	title: 'Login | ADR Vault',
};

export default function LoginPage(): ReactNode {
	return (
		<main className="flex min-h-screen items-center justify-center">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Sign in to your account</CardTitle>
				</CardHeader>
				<CardContent>
					<LoginForm />
				</CardContent>
				<CardFooter className="justify-center">
					<p className="text-sm text-muted-foreground">
						Don&apos;t have an account?{' '}
						<Link href="/register" className="text-primary underline-offset-4 hover:underline">
							Register
						</Link>
					</p>
				</CardFooter>
			</Card>
		</main>
	);
}
