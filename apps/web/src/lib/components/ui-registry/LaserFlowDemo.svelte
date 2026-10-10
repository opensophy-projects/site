<script lang="ts">
  import LaserFlow from '$lib/components/ui-registry/LaserFlow.svelte';

  let {
    color = '#f43f5e',
    intensity = 1.8,
    beamWidth = 1.5,
    beamPosition = 0.6,
    flare = 1.5,
    spread = 1.5,
    spill = 1,
    fog = 0.2,
    dust = 1.6,
    streaks = 1.5,
    speed = 1.5,
    mouseInteraction = true
  }: {
    color?: string;
    intensity?: number;
    beamWidth?: number;
    beamPosition?: number;
    flare?: number;
    spread?: number;
    spill?: number;
    fog?: number;
    dust?: number;
    streaks?: number;
    speed?: number;
    mouseInteraction?: boolean;
  } = $props();

  let card = $state<HTMLElement | null>(null);
</script>

<div class="relative h-[460px] w-full overflow-hidden rounded-lg bg-[#08070b]">
  <LaserFlow
    surface={card}
    {color}
    {intensity}
    {beamWidth}
    {beamPosition}
    {flare}
    {spread}
    {spill}
    {fog}
    {dust}
    {streaks}
    {speed}
    {mouseInteraction}
  />
  <div
    bind:this={card}
    class="absolute inset-x-[22%] top-[58%] bottom-[14%] flex items-center justify-center rounded-2xl border border-white/10 bg-[#0d0b12] text-sm text-white/60"
  >
    Луч падает на этот блок
  </div>
</div>