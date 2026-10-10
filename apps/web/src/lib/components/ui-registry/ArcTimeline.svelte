<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';
  import type { ArcTimelineProps, ArcTimelineRenderable } from './ArcTimeline.types';

  type TimelineStep = { line: ArcTimelineProps['data'][number]; step: ArcTimelineProps['data'][number]['steps'][number]; lineIndex: number; stepIndex: number; angle: number; isFirstStep: boolean; isLastStep: boolean };
  let { ref = $bindable(null), class: className, data, arcConfig = {}, defaultActiveStep = {}, ...restProps }: ArcTimelineProps = $props();
  let circleWidth = $derived(arcConfig.circleWidth ?? 5000);
  let angleBetweenMinorSteps = $derived(arcConfig.angleBetweenMinorSteps ?? 0.35);
  let lineCountFillBetweenSteps = $derived(arcConfig.lineCountFillBetweenSteps ?? 10);
  let boundaryPlaceholderLinesCount = $derived(arcConfig.boundaryPlaceholderLinesCount ?? 50);
  function getInitialRotation() { const time = defaultActiveStep.time ?? data[0]?.time; const index = defaultActiveStep.stepIndex ?? 0; let count = 0; for (const item of data) { if (item.time === time) { count += index; break; } count += item.steps.length; } return -count * angleBetweenMinorSteps * (lineCountFillBetweenSteps + 1) - angleBetweenMinorSteps * boundaryPlaceholderLinesCount; }
  let rotation = $state(getInitialRotation());
  let timelineSteps = $derived.by(() => { const steps: TimelineStep[] = []; let before = 0; data.forEach((line, lineIndex) => { line.steps.forEach((step, stepIndex) => { const angle = angleBetweenMinorSteps * (lineCountFillBetweenSteps + 1) * (before + stepIndex) + angleBetweenMinorSteps * boundaryPlaceholderLinesCount; steps.push({ line, step, lineIndex, stepIndex, angle, isFirstStep: lineIndex === 0 && stepIndex === 0, isLastStep: lineIndex === data.length - 1 && stepIndex === line.steps.length - 1 }); }); before += line.steps.length; }); return steps; });
  function snippet(value: ArcTimelineRenderable): Snippet | null { return typeof value === 'function' ? value : null; }
  function text(value: ArcTimelineRenderable): string | number | null { return typeof value === 'string' || typeof value === 'number' ? value : null; }
  function placeholders(first: boolean, last: boolean, angle: number) { const count = first || last ? boundaryPlaceholderLinesCount : lineCountFillBetweenSteps; return Array.from({ length: count }, (_, i) => first ? i * angleBetweenMinorSteps : angle + (i + 1) * angleBetweenMinorSteps); }
  function active(angle: number) { return Math.abs(angle + rotation) < 0.01; }
  function setActive(angle: number) { rotation = -angle; }
</script>

<div bind:this={ref} class={cn('relative h-[380px] w-full overflow-hidden', className as string)} {...restProps}>
  <div class="absolute top-28 left-1/2 aspect-square origin-center rounded-full transition-all duration-500 ease-in-out" style:transform={`translateX(-50%) rotate(${rotation}deg)`} style:width={`${circleWidth}px`}>
    {#each timelineSteps as item (`${item.lineIndex}-${item.stepIndex}`)}
      {@const isActive = active(item.angle)}
      {@const icon = snippet(item.step.icon)}
      {@const iconValue = text(item.step.icon)}
      {@const content = snippet(item.step.content)}
      {@const contentValue = text(item.step.content)}
      {@const time = snippet(item.line.time)}
      {@const timeValue = text(item.line.time)}
      {#if item.isFirstStep}{#each placeholders(true, false, item.angle) as fillAngle, i (`before-${i}`)}<div class="absolute top-0 left-1/2 h-[34px] w-px -translate-x-1/2" style:transform-origin={`50% ${circleWidth / 2}px`} style:transform={`rotate(${fillAngle}deg)`}><div class="h-full w-full bg-[var(--placeholder-line-color,#a1a1a1)] dark:bg-[var(--placeholder-line-color,#737373)]" style:transform={`rotate(${-fillAngle - rotation}deg)`}></div></div>{/each}{/if}
      <div class={cn('absolute top-0 left-1/2 -translate-x-1/2 cursor-pointer transition-all duration-200', isActive ? 'h-[120px] w-0.5' : 'h-16 w-[1.5px]')} role="button" tabindex="0" style:transform-origin={`50% ${circleWidth / 2}px`} style:transform={`rotate(${item.angle}deg)`} onclick={() => setActive(item.angle)} onkeydown={(event) => (event.key === 'Enter' || event.key === ' ') && (event.preventDefault(), setActive(item.angle))}>
        <div class={cn('h-full w-full transition-colors duration-200', isActive ? 'bg-[var(--step-line-active-color,#888)] dark:bg-[var(--step-line-active-color,#9780ff)]' : 'bg-[var(--step-line-inactive-color,#b1b1b1)] dark:bg-[var(--step-line-inactive-color,#737373)]')} style:transform={`rotate(${-item.angle - rotation}deg)`}>
          <div class={cn('absolute bottom-0 left-1/2 aspect-square -translate-x-1/2', isActive ? 'translate-y-[calc(100%+14px)] scale-[1.2] text-[var(--icon-active-color,#555)] dark:text-[var(--icon-active-color,#d4d4d4)]' : 'translate-y-[calc(100%+4px)] text-[var(--icon-inactive-color,#a3a3a3)]')}>
            {#if icon}{@render icon()}{:else if iconValue !== null}{iconValue}{/if}
          </div>
          <p class={cn('absolute bottom-0 left-1/2 line-clamp-3 flex w-[240px] -translate-x-1/2 translate-y-[calc(100%+42px)] items-center justify-center text-center text-sm transition-opacity duration-300', 'text-[var(--description-color,#555)] dark:text-[var(--description-color,#d4d4d4)]', isActive ? 'opacity-100' : 'opacity-0')}>{#if content}{@render content()}{:else if contentValue !== null}{contentValue}{/if}</p>
        </div>
        {#if item.stepIndex === 0}<div class={cn('absolute top-0 left-1/2 z-10 -translate-x-1/2 -translate-y-[calc(100%+24px)] whitespace-nowrap', isActive ? 'text-[var(--time-active-color,#555)] dark:text-[var(--time-active-color,#d4d4d4)]' : 'text-[var(--time-inactive-color,#a3a3a3)]')}>{#if time}{@render time()}{:else if timeValue !== null}{timeValue}{/if}</div>{/if}
      </div>
      {#each placeholders(false, item.isLastStep, item.angle) as fillAngle, i (`after-${i}`)}<div class="absolute top-0 left-1/2 h-[34px] w-px -translate-x-1/2" style:transform-origin={`50% ${circleWidth / 2}px`} style:transform={`rotate(${fillAngle}deg)`}><div class="h-full w-full bg-[var(--placeholder-line-color,#a1a1a1)] dark:bg-[var(--placeholder-line-color,#737373)]" style:transform={`rotate(${-fillAngle - rotation}deg)`}></div></div>{/each}
    {/each}
  </div>
</div>
