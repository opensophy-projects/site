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

	const canUseWindow = typeof window !== 'undefined';
	const canUseDocument = typeof document !== 'undefined';

	// Пробуем современный Clipboard API
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (canUseWindow && navigator.clipboard?.writeText) {
		try {
			await navigator.clipboard.writeText(text);
			return;
		} catch {
			// Переходим к устаревшему методу
		}
	}

	// Fallback для окружений без рабочего Clipboard API
	if (!canUseDocument) {
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

	try {
		// execCommand устарел, но остаётся единственным fallback для старых браузеров
		// eslint-disable-next-line @typescript-eslint/no-deprecated
		if (document.queryCommandSupported('copy') && document.execCommand('copy')) {
			textArea.remove();
			return;
		}
	} catch {
		// Оба метода недоступны
	}

	textArea.remove();
	throw new CopyError('Clipboard unavailable');
}
