'use client';

import type { FormEvent, ReactNode } from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';

type FormProps<TFieldValues extends FieldValues> = {
	form: UseFormReturn<TFieldValues>;
	onSubmit: (values: TFieldValues) => void | Promise<void>;
	children: ReactNode;
	className?: string;
};

export function Form<TFieldValues extends FieldValues>({
	form,
	onSubmit,
	children,
	className,
}: FormProps<TFieldValues>): ReactNode {
	return (
		<form
			onSubmit={(e: FormEvent<HTMLFormElement>) => {
				e.preventDefault();
				void form.handleSubmit(onSubmit)(e);
			}}
			className={className}
		>
			{children}
		</form>
	);
}
