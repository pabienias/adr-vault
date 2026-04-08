'use client';

import { Field } from '@base-ui/react/field';
import type { ReactNode } from 'react';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { Controller } from 'react-hook-form';

import { cn } from '@/lib/utils';

type FormFieldProps<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>> = {
	control: Control<TFieldValues>;
	name: TName;
	label: string;
	description?: string;
	children: (field: {
		value: TFieldValues[TName];
		onChange: (...event: unknown[]) => void;
		onBlur: () => void;
		name: TName;
		disabled?: boolean;
	}) => ReactNode;
	className?: string;
};

export function FormField<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>({
	control,
	name,
	label,
	description,
	children,
	className,
}: FormFieldProps<TFieldValues, TName>): ReactNode {
	return (
		<Controller
			control={control}
			name={name}
			render={({ field, fieldState }) => (
				<Field.Root
					name={name}
					invalid={fieldState.invalid}
					className={cn('flex flex-col gap-1.5', className)}
				>
					<Field.Label className="flex items-center gap-2 text-sm leading-none font-medium select-none">
						{label}
					</Field.Label>
					{description && (
						<Field.Description className="text-muted-foreground text-xs">
							{description}
						</Field.Description>
					)}
					{children({
						value: field.value,
						onChange: field.onChange,
						onBlur: field.onBlur,
						name: field.name as TName,
						disabled: field.disabled,
					})}
					{fieldState.error && (
						<Field.Error className="text-destructive text-xs font-medium">
							{fieldState.error.message}
						</Field.Error>
					)}
				</Field.Root>
			)}
		/>
	);
}
