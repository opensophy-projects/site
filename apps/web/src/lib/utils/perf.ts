/**
 * Оценка «мощности» устройства на стороне браузера.
 *
 * Используется, чтобы на слабых устройствах (смартфоны, планшеты, старые
 * ноутбуки) не запускать тяжёлые WebGL/ASCII-рендеры — они приводят к
 * белому экрану и «сломанным» картинкам.
 */

let cached: boolean | null = null;

export function canRunHeavyEffects(): boolean {
  if (typeof window === "undefined") return false; // SSR
  if (cached !== null) return cached;

  const nav = navigator as Navigator & {
    deviceMemory?: number;
    userAgentData?: { mobile?: boolean };
  };

  const cores = navigator.hardwareConcurrency ?? 2;
  const memory = nav.deviceMemory ?? 4; // МБ, если браузер не отдаёт — считаем среднее
  const isMobile =
    nav.userAgentData?.mobile ??
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const smallViewport = Math.min(window.innerWidth, window.innerHeight) < 768;

  // Тяжёлый рендер разрешаем только десктопам/планшетам с запасом ресурсов:
  // много ядер, достаточно памяти и не мобильный UA.
  const capable =
    !isMobile &&
    !coarsePointer &&
    !smallViewport &&
    cores >= 4 &&
    memory >= 4;

  cached = capable;
  return capable;
}
