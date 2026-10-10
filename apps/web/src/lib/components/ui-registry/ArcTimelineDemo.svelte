<script lang="ts">
  import ArcTimeline from './ArcTimeline.svelte';
  const data = [
    { time: '2023', steps: [{ icon: '01', content: 'Исследование идеи и первые прототипы' }, { icon: '02', content: 'Формирование визуального языка' }] },
    { time: '2024', steps: [{ icon: '03', content: 'Публикация первых open-source компонентов' }, { icon: '04', content: 'Рост библиотеки и документации' }] },
    { time: '2025', steps: [{ icon: '05', content: 'Новые инструменты для DevSecOps' }] }
  ];
</script>
<div class="w-full rounded-lg border border-border bg-background p-2"><ArcTimeline {data} /></div>
