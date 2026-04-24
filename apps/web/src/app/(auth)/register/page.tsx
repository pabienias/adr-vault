import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RegistrationForm } from '@/features/auth/components/RegistrationForm';

export const metadata: Metadata = {
	title: 'Register | ADR Vault',
};

export default function RegisterPage(): ReactNode {
	return (
		<>
			<CardHeader>
				<CardTitle>Create your account</CardTitle>
			</CardHeader>
			<CardContent>
				<RegistrationForm />
			</CardContent>
			<CardFooter className="justify-center">
				<p className="text-sm text-muted-foreground">
					Already have an account?{' '}
					<Link href="/login" className="text-primary underline-offset-4 hover:underline">
						Sign in
					</Link>
				</p>
			</CardFooter>
		</>
	);
}
