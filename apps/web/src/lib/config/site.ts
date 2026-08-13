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
	/** Default SEO description for the homepage. */
	description:
		'Opensophy — инициатива открытой философии в IT. Качественные и доступные знания, услуги и инструменты в области DevSecOps, кибербезопасности и автоматизации.',
	/** Fallback SEO description used on content pages without a frontmatter description. */
	fallbackDescription:
		'Opensophy — инициатива открытой философии в IT. DevSecOps, кибербезопасность, автоматизация и open-source инструменты.',
	/** Author shown in metadata and structured data. */
	author: 'opensophy',
	/** Primary SEO keywords for indexing and discovery. */
	keywords: [
		'opensophy',
		'opensophy - открытая философия',
		'открытая философия',
		'открытая философия в IT',
		'opensophy DevSecOps',
		'opensophy кибербезопасность',
		'DevSecOps',
		'DevSecOps инженер',
		'кибербезопасность',
		'информационная безопасность',
		'безопасность',
		'безопасность приложений',
		'безопасность инфраструктуры',
		'web app audit',
		'аудит приложений',
		'аудит инфраструктуры',
		'SAST',
		'DAST',
		'SCA',
		'CI/CD',
		'CI/CD security',
		'CI/CD безопасность',
		'Zero Trust',
		'mTLS',
		'mTLS сертификаты',
		'Docker security',
		'безопасность Docker',
		'Bash',
		'Python',
		'AI security',
		'инфраструктура',
		'автоматизация',
		'автоматизация рутинных задач',
		'open source',
		'open-source',
		'открытый исходный код',
		'документация',
		'os.docs',
		'os.ui',
		'os.mtls',
		'os.net',
		'os.oasm',
		'os.port',
		'os.forum',
		'WAF',
		'web application firewall',
		'VPN',
		'P2P',
		'responsible disclosure',
		'ответственное раскрытие уязвимостей',
		'pentest',
		'пентест',
		'проверка защищённости'
	],
	/** Default social preview image path. */
	ogImage: '/og-image.jpg',
	/** External profile links used by docs actions and metadata. */
	links: {
		github: 'https://github.com/opensophy-projects',
		telegram: 'https://t.me/opensophy',
		email: 'opensophy@gmail.com'
	},
	/** Package metadata used in installation snippets and docs helpers. */
	package: {
		name: '@opensophy/docs'
	}
};

/** Inferred type for strongly-typed consumers of `siteConfig`. */
export type SiteConfig = typeof siteConfig;
