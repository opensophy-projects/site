import { error } from '@sveltejs/kit';
import ImageResponse from '@takumi-rs/image-response';
import type { RequestHandler } from './$types';
import { getContentSectionMetadata, siteConfig } from '$lib';
import { contentSections, getContentSectionManifest } from '$lib/content/sections';

export const prerender = true;

export const entries = () => {
	const result: { section: string; slug: string }[] = [];

	for (const section of contentSections) {
		const manifest = getContentSectionManifest(section.id);
		for (const item of manifest) {
			result.push({
				section: section.id,
				slug: item.slug
			});
		}
	}

	return result;
};

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const MAX_TITLE_LENGTH = 88;
const MAX_DESCRIPTION_LENGTH = 180;

type TakumiElement = {
	type: string;
	props: Record<string, unknown>;
	key: string | null;
};

type TakumiChild = TakumiElement | string;

const el = (
	type: string,
	props: Record<string, unknown> = {},
	...children: TakumiChild[]
): TakumiElement => ({
	type,
	key: null,
	props:
		children.length === 0
			? props
			: {
					...props,
					children: children.length === 1 ? children[0] : children
				}
});

const clampText = (value: string, maxLength: number) => {
	const text = value.trim();
	if (text.length <= maxLength) return text;
	return `${text.slice(0, maxLength - 1).trimEnd()}…`;
};

export const GET: RequestHandler = async ({ params }) => {
	const { section: sectionId, slug } = params;

	const pathname = `/${sectionId}/${slug}`;
	const metadata = getContentSectionMetadata(sectionId, pathname);
	if (!metadata) {
		error(404, 'Document not found');
	}

	const title = clampText(metadata.title, MAX_TITLE_LENGTH);
	const description = clampText(
		metadata.description ?? siteConfig.description,
		MAX_DESCRIPTION_LENGTH
	);

	const ACCENT = '#f43f5e';

	const component = el(
		'div',
		{
			style: {
				display: 'flex',
				position: 'relative',
				flexDirection: 'column',
				justifyContent: 'space-between',
				width: '100%',
				height: '100%',
				padding: 56,
				background: '#090909',
				fontFamily: 'Inter, sans-serif',
				overflow: 'hidden'
			}
		},
		// Radial glow — same as hero section
		el('div', {
			style: {
				position: 'absolute',
				inset: 0,
				display: 'flex',
				background: `radial-gradient(110% 110% at 50% 110%, transparent 35%, ${ACCENT}38 62%, ${ACCENT}22 78%, transparent 100%)`
			}
		}),
		// Top accent bar
		el('div', {
			style: {
				display: 'flex',
				alignItems: 'center',
				gap: 14
			}
		},
			el('div', {
				style: {
					display: 'flex',
					width: 4,
					height: 28,
					borderRadius: 4,
					background: ACCENT
				}
			}),
			el('div', {
				style: {
					display: 'flex',
					fontSize: 26,
					fontWeight: 500,
					color: '#f4f4f5',
					letterSpacing: '-0.02em'
				}
			}, siteConfig.name)
		),
		// Bottom content
		el(
			'div',
			{
				style: {
					display: 'flex',
					flexDirection: 'column',
					gap: 20
				}
			},
			el(
				'div',
				{
					style: {
						display: 'flex',
						maxWidth: 1060,
						fontSize: 82,
						lineHeight: 1.0,
						color: '#f4f4f5',
						fontWeight: 500,
						letterSpacing: '-0.03em'
					}
				},
				title
			),
			el(
				'div',
				{
					style: {
						display: 'flex',
						maxWidth: 960,
						fontSize: 30,
						lineHeight: 1.35,
						color: '#71717a',
						fontWeight: 400
					}
				},
				description
			)
		)
	);

	const response = new ImageResponse(component, {
		width: OG_WIDTH,
		height: OG_HEIGHT,
		format: 'png',
		headers: {
			'content-type': 'image/png',
			'cache-control': 'public, max-age=3600'
		}
	});

	await response.ready;
	return response;
};
