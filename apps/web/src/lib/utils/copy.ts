class CopyError extends Error {
	constructor(message: string, options?: ErrorOptions) {
		super(message, options);
		this.name = 'CopyError';
	}
}

export async function copyToClipboard(text: string): Promise<void> {
	if (!text) throw new CopyError('No content to copy');

	 
	if (!navigator.clipboard?.writeText) {
		throw new CopyError('Clipboard unavailable');
	}

	try {
		await navigator.clipboard.writeText(text);
	} catch {
		throw new CopyError('Clipboard unavailable');
	}
}
