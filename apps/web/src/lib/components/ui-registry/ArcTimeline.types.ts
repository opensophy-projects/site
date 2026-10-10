import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
export type ArcTimelineRenderable = Snippet | string | number | boolean | null | undefined;
export type ArcTimelineStep = { icon: ArcTimelineRenderable; content: ArcTimelineRenderable };
export type ArcTimelineItem = { time: ArcTimelineRenderable; steps: ArcTimelineStep[] };
export type ArcTimelineArcConfig = { circleWidth?: number; angleBetweenMinorSteps?: number; lineCountFillBetweenSteps?: number; boundaryPlaceholderLinesCount?: number };
export type ArcTimelineDefaultActiveStep = { time?: ArcTimelineItem['time']; stepIndex?: number };
export type ArcTimelineProps = HTMLAttributes<HTMLDivElement> & { ref?: HTMLDivElement | null; data: ArcTimelineItem[]; arcConfig?: ArcTimelineArcConfig; defaultActiveStep?: ArcTimelineDefaultActiveStep };
export type { Snippet };
