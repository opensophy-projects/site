class CopyError extends Error {
	constructor(message: string, options?: ErrorOptions) {
		super(message, options);
		this.name = 'CopyError';
	}
}

/**
 * Копирует текст в буфер обмена.
 *
 * Использует современный Clipboard API, с fallback на устаревший
 * `document.execCommand('copy')` для старых браузеров и окружений,
 * где Clipboard API недоступен.
 *
 * @throws {CopyError} если операция копирования не удалась.
 */
export async function copyToClipboard(text: string): Promise<void> {
	if (!text) throw new CopyError('No content to copy');

	// Пробуем современный Clipboard API
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (navigator.clipboard?.writeText) {
		try {
			await navigator.clipboard.writeText(text);
			return;
		} catch {
			// Переходим к устаревшему методу
		}
	}

	// Fallback для окружений без рабочего Clipboard API
	if (typeof document === 'undefined') {
		throw new CopyError('Clipboard unavailable');
	}

	const textArea = document.createElement('textarea');
	textArea.value = text;

	// Элемент невидим, но присутствует в DOM — браузер разрешает команду копирования
	textArea.style.position = 'fixed';
	textArea.style.left = '-9999px';
	textArea.style.top = '0';
	textArea.setAttribute('readonly', '');
	document.body.appendChild(textArea);

	textArea.focus();
	textArea.select();

	// eslint-disable-next-line @typescript-eslint/no-deprecated
	const copied = document.execCommand('copy');

	textArea.remove();

	if (!copied) {
		throw new CopyError('Clipboard unavailable');
	}
}
