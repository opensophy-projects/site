/**
 * Canonical site-level metadata shared across SEO tags, manifests, and feeds.
 * Update these values when using the docs template for a new project.
 */
export const siteConfig = {
	/** Primary site name used in titles and Open Graph site fields. */
	name: 'opensophy',
	/** Compact site name for environments with strict length limits. */
	shortName: 'opensophy',
	/** Public canonical URL used to build absolute links. */
	url: 'https://opensophy.com',
	/** Default SEO description for the homepage and fallback metadata. */
	description:
		'Opensophy — инициатива открытой философии в IT. Качественные и доступные знания, услуги и инструменты в области DevSecOps, кибербезопасности и автоматизации.',
	/** Author shown in metadata and structured data. */
	author: 'opensophy',
	/** Primary SEO keywords for indexing and discovery. */
	keywords: [
		'opensophy',
		'DevSecOps',
		'кибербезопасность',
		'безопасность',
		'SAST',
		'DAST',
		'SCA',
		'Zero Trust',
		'mTLS',
		'CI/CD security',
		'инфраструктура',
		'автоматизация',
		'open source',
		'документация'
	],
	/** Default social preview image path. */
	ogImage: '/og-image.jpg',
	/** External profile links used by docs actions and metadata. */
	links: {
		github: 'https://github.com/opensophy-projects',
		email: 'opensophy@gmail.com'
	},
	/** Package metadata used in installation snippets and docs helpers. */
	package: {
		name: '@opensophy/docs'
	}
};

/** Inferred type for strongly-typed consumers of `siteConfig`. */
export type SiteConfig = typeof siteConfig;
