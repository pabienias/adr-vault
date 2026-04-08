'use client';

import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider, environmentManager } from '@tanstack/react-query';

function makeQueryClient(): QueryClient {
	return new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 60 * 1000,
			},
		},
	});
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient(): QueryClient {
	if (environmentManager.isServer()) {
		return makeQueryClient();
	}

	if (!browserQueryClient) {
		browserQueryClient = makeQueryClient();
	}

	return browserQueryClient;
}

export function QueryProvider({ children }: { children: ReactNode }): ReactNode {
	const queryClient = getQueryClient();

	return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
