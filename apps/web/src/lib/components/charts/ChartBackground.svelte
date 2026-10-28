<script lang="ts">
	import type { BackgroundVariant } from './types';

	/**
	 * Decorative SVG pattern drawn behind the chart. Edges fade out through a
	 * blurred mask so the texture never ends with a hard line.
	 */
	type Props = { variant: BackgroundVariant };

	let { variant }: Props = $props();

	const baseId = $props.id();
	const patternId = $derived(`${baseId}-bg-${variant}`);
	const maskId = `${baseId}-bg-edge-fade`;
	const filterId = `${baseId}-bg-blur`;
</script>

<g class="text-foreground/15">
	<defs>
		{#if variant === 'dots'}
			<pattern id={patternId} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
				<circle cx="2" cy="2" r="1" fill="currentColor" />
			</pattern>
		{:else if variant === 'grid'}
			<pattern id={patternId} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
				<path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" stroke-width="0.5" />
			</pattern>
		{:else if variant === 'cross-hatch'}
			<pattern id={patternId} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
				<path
					d="M 0 0 L 20 20 M 20 0 L 0 20"
					fill="none"
					stroke="currentColor"
					stroke-opacity="0.6"
					stroke-width="0.5"
				/>
			</pattern>
		{:else if variant === 'diagonal-lines'}
			<pattern
				id={patternId}
				x="0"
				y="0"
				width="6"
				height="6"
				patternUnits="userSpaceOnUse"
				patternTransform="rotate(45)"
			>
				<line x1="0" y1="0" x2="0" y2="6" stroke="currentColor" stroke-width="0.5" />
			</pattern>
		{:else if variant === 'plus'}
			<pattern id={patternId} x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
				<path
					d="M 8 4 L 8 12 M 4 8 L 12 8"
					fill="none"
					stroke="currentColor"
					stroke-width="0.5"
					stroke-linecap="round"
				/>
			</pattern>
		{:else if variant === 'falling-triangles'}
			<pattern id={patternId} x="0" y="0" width="18" height="36" patternUnits="userSpaceOnUse">
				<path
					d="M2 6h12L8 18 2 6zm18 36h12l-6 12-6-12z"
					transform="scale(0.5)"
					fill="currentColor"
					fill-opacity="0.4"
				/>
			</pattern>
		{:else if variant === '4-pointed-star'}
			<pattern id={patternId} x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
				<polygon
					fill-rule="evenodd"
					points="5 3 8 4 5 5 4 8 3 5 0 4 3 3 4 0 5 3"
					fill="currentColor"
					fill-opacity="0.4"
				/>
			</pattern>
		{:else if variant === 'tiny-checkers'}
			<pattern id={patternId} x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
				<path
					fill-rule="evenodd"
					d="M0 0h4v4H0V0zm4 4h4v4H4V4z"
					fill="currentColor"
					fill-opacity="0.2"
				/>
			</pattern>
		{:else if variant === 'overlapping-circles'}
			<pattern id={patternId} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
				<path
					fill-rule="evenodd"
					d="M25 25c0-2.762 2.238-5 5-5s5 2.238 5 5-2.238 5-5 5c0 2.762-2.238 5-5 5s-5-2.238-5-5 2.238-5 5-5zM5 5c0-2.762 2.238-5 5-5s5 2.238 5 5-2.238 5-5 5c0 2.762-2.238 5-5 5S0 12.762 0 10s2.238-5 5-5zm5 4c2.209 0 4-1.791 4-4s-1.791-4-4-4-4 1.791-4 4 1.791 4 4 4zm20 20c2.209 0 4-1.791 4-4s-1.791-4-4-4-4 1.791-4 4 1.791 4 4 4z"
					fill="currentColor"
					fill-opacity="0.4"
				/>
			</pattern>
		{:else if variant === 'wiggle-lines'}
			<pattern
				id={patternId}
				x="0"
				y="0"
				width="52"
				height="26"
				patternUnits="userSpaceOnUse"
				patternTransform="scale(0.6)"
			>
				<path
					d="M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4v2c-3.314 0-6-2.686-6-6 0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6zm25.464-1.95l8.486 8.486-1.414 1.414-8.486-8.486 1.414-1.414z"
					fill="currentColor"
					fill-opacity="0.4"
				/>
			</pattern>
		{:else}
			<pattern
				id={patternId}
				x="0"
				y="0"
				width="100"
				height="100"
				patternUnits="userSpaceOnUse"
				patternTransform="scale(0.6667)"
			>
				<path
					d="M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z"
					fill="currentColor"
					fill-opacity="0.4"
					fill-rule="evenodd"
				/>
			</pattern>
		{/if}
		<filter id={filterId}>
			<feGaussianBlur stdDeviation="25" />
		</filter>
		<mask id={maskId} maskUnits="userSpaceOnUse">
			<rect x="8%" y="20%" width="85%" height="60%" fill="white" filter="url(#{filterId})" />
		</mask>
	</defs>
	<rect width="100%" height="100%" fill="url(#{patternId})" mask="url(#{maskId})" />
</g>
