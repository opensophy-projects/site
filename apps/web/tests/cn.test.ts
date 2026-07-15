import { describe, it, expect } from 'vitest';
import { cn } from '$lib/utils/cn';

describe('cn', () => {
	it('объединяет несколько классов', () => {
		expect(cn('foo', 'bar')).toBe('foo bar');
	});

	it('отбрасывает falsy-значения', () => {
		expect(cn('foo', false, null, undefined, '', 'bar')).toBe('foo bar');
	});

	it('разрешает конфликтующие tailwind-классы через twMerge', () => {
		expect(cn('px-2', 'px-4')).toBe('px-4');
	});

	it('возвращает пустую строку без аргументов', () => {
		expect(cn()).toBe('');
	});

	it('обрабатывает условные классы', () => {
		const isActive = true;
		expect(cn('base', isActive && 'active', !isActive && 'inactive')).toBe('base active');
	});
});
