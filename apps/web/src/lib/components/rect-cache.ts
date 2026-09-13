/** Caches an element's viewport rectangle for pointer-heavy interactions. */
export function createRectCache(element: HTMLElement) {
  let current = element.getBoundingClientRect();

  const update = () => {
    current = element.getBoundingClientRect();
  };

  const observer = new ResizeObserver(update);
  observer.observe(element);
  window.addEventListener("resize", update, { passive: true });
  window.addEventListener("scroll", update, { passive: true, capture: true });

  return {
    get current() {
      return current;
    },
    destroy() {
      observer.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    },
  };
}
