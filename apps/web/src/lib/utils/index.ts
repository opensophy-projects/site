import { twMerge } from 'tailwind-merge';

export type WithoutChildren<T> = Omit<T, 'children'>;

export function cn(...inputs: (string | false | null | undefined)[]) {
	return twMerge(inputs.filter(Boolean).join(' '));
}

export * from './text-utils';
