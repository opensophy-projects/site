/**
 * Global visual identity used by shared UI elements.
 * Update these values when rebranding the template.
 *
 * Logo fallback priority:
 * 1. logoLight / logoDark — separate theme-specific logos
 * 2. logo — single logo used in both themes (if logoLight/logoDark not set)
 */
export const brandingConfig = {
	/** Universal logo used for both themes when logoLight/logoDark are not set. */
	logo: '/logo.png',
	/** Light theme logo. Falls back to logoDark, then logo. */
	logoLight: '',
	/** Dark theme logo. Falls back to logoLight, then logo. */
	logoDark: '',
	/** Human-readable brand name displayed in the UI. */
	name: 'opensophy'
};
