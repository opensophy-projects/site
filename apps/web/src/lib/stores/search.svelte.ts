import type { SearchMode } from '$lib/utils/search';

export class SearchState {
	isOpen = $state(false);
	initialMode = $state<SearchMode | null>(null);

	toggle() {
		this.isOpen = !this.isOpen;
	}

	open(mode?: SearchMode) {
		this.initialMode = mode ?? null;
		this.isOpen = true;
	}

	consumeInitialMode() {
		const mode = this.initialMode;
		this.initialMode = null;
		return mode;
	}

	close() {
		this.isOpen = false;
	}
}

export const searchState = new SearchState();
