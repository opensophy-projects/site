<script module lang="ts">
  export type AsciiAnimation =
    | "none"
    | "wave"
    | "glitch"
    | "typewriter"
    | "pulse"
    | "scan";

  const GLYPH_HEIGHT = 6;
  const DEFAULT_RAMP = "░▒▓█";

  // Блочный шрифт 8x6. Каждый глиф ровно 8 колонок шириной, чтобы сетка
  // оставалась прямоугольной и поколоночные эффекты совпадали между буквами.
  const FONT: Record<string, string[]> = {
    A: ["  ████  ", " ██  ██ ", "████████", "██    ██", "██    ██", "██    ██"],
    B: ["███████ ", "██    ██", "███████ ", "██    ██", "██    ██", "███████ "],
    C: [" ███████", "██      ", "██      ", "██      ", "██      ", " ███████"],
    D: ["███████ ", "██    ██", "██    ██", "██    ██", "██    ██", "███████ "],
    E: ["████████", "██      ", "██████  ", "██      ", "██      ", "████████"],
    F: ["████████", "██      ", "██████  ", "██      ", "██      ", "██      "],
    G: [" ███████", "██      ", "██  ████", "██    ██", "██    ██", " ███████"],
    H: ["██    ██", "██    ██", "████████", "██    ██", "██    ██", "██    ██"],
    I: ["████████", "   ██   ", "   ██   ", "   ██   ", "   ██   ", "████████"],
    J: ["████████", "      ██", "      ██", "      ██", "██    ██", " ███████"],
    K: ["██    ██", "██  ██  ", "████    ", "██  ██  ", "██    ██", "██    ██"],
    L: ["██      ", "██      ", "██      ", "██      ", "██      ", "████████"],
    M: ["██    ██", "████████", "██ ██ ██", "██    ██", "██    ██", "██    ██"],
    N: ["██    ██", "███   ██", "██ ██ ██", "██   ███", "██    ██", "██    ██"],
    O: [" ███████", "██    ██", "██    ██", "██    ██", "██    ██", " ███████"],
    P: ["███████ ", "██    ██", "███████ ", "██      ", "██      ", "██      "],
    Q: [" ██████ ", "██    ██", "██    ██", "██ ██ ██", "██   ███", " ███████"],
    R: ["███████ ", "██    ██", "███████ ", "██   ██ ", "██    ██", "██    ██"],
    S: [" ███████", "██      ", " ██████ ", "      ██", "      ██", "███████ "],
    T: ["████████", "   ██   ", "   ██   ", "   ██   ", "   ██   ", "   ██   "],
    U: ["██    ██", "██    ██", "██    ██", "██    ██", "██    ██", " ███████"],
    V: ["██    ██", "██    ██", "██    ██", " ██  ██ ", "  ████  ", "   ██   "],
    W: ["██    ██", "██    ██", "██    ██", "██ ██ ██", "████████", "██    ██"],
    X: ["██    ██", " ██  ██ ", "  ████  ", "  ████  ", " ██  ██ ", "██    ██"],
    Y: ["██    ██", " ██  ██ ", "  ████  ", "   ██   ", "   ██   ", "   ██   "],
    Z: ["████████", "      ██", "    ██  ", "  ██    ", "██      ", "████████"],
    "0": [" ██████ ", "██    ██", "██    ██", "██    ██", "██    ██", " ██████ "],
    "1": ["   ██   ", "  ███   ", "   ██   ", "   ██   ", "   ██   ", " ██████ "],
    "2": [" ██████ ", "██    ██", "     ██ ", "   ██   ", " ██     ", "████████"],
    "3": [" ██████ ", "██    ██", "    ███ ", "      ██", "██    ██", " ██████ "],
    "4": ["██    ██", "██    ██", "████████", "      ██", "      ██", "      ██"],
    "5": ["████████", "██      ", "███████ ", "      ██", "██    ██", " ██████ "],
    "6": [" ██████ ", "██      ", "███████ ", "██    ██", "██    ██", " ██████ "],
    "7": ["████████", "      ██", "     ██ ", "    ██  ", "   ██   ", "   ██   "],
    "8": [" ██████ ", "██    ██", " ██████ ", "██    ██", "██    ██", " ██████ "],
    "9": [" ██████ ", "██    ██", " ███████", "      ██", "      ██", " ██████ "],
    ".": ["        ", "        ", "        ", "        ", "   ██   ", "   ██   "],
    ",": ["        ", "        ", "        ", "   ██   ", "   ██   ", "  ██    "],
    "!": ["   ██   ", "   ██   ", "   ██   ", "   ██   ", "        ", "   ██   "],
    "?": [" ██████ ", "██    ██", "     ██ ", "   ██   ", "        ", "   ██   "],
    "-": ["        ", "        ", "████████", "        ", "        ", "        "],
    "+": ["        ", "   ██   ", "████████", "   ██   ", "        ", "        "],
    "=": ["        ", "████████", "        ", "████████", "        ", "        "],
    ":": ["        ", "   ██   ", "        ", "        ", "   ██   ", "        "],
    "'": ["   ██   ", "   ██   ", "        ", "        ", "        ", "        "],
    "/": ["      ██", "     ██ ", "    ██  ", "   ██   ", "  ██    ", " ██     "],
    "\\": [
      " ██     ",
      "  ██    ",
      "   ██   ",
      "    ██  ",
      "     ██ ",
      "      ██",
    ],
    "*": ["        ", "██ ██ ██", " ██████ ", "██ ██ ██", "        ", "        "],
    "<": ["     ██ ", "   ██   ", " ██     ", "   ██   ", "     ██ ", "        "],
    ">": [" ██     ", "   ██   ", "     ██ ", "   ██   ", " ██     ", "        "],
    "(": ["    ██  ", "  ██    ", "  ██    ", "  ██    ", "  ██    ", "    ██  "],
    ")": ["  ██    ", "    ██  ", "    ██  ", "    ██  ", "    ██  ", "  ██    "],
    "[": ["  ████  ", "  ██    ", "  ██    ", "  ██    ", "  ██    ", "  ████  "],
    "]": ["  ████  ", "    ██  ", "    ██  ", "    ██  ", "    ██  ", "  ████  "],
    "#": [" ██  ██ ", "████████", " ██  ██ ", "████████", " ██  ██ ", "        "],
    "@": [" ██████ ", "██    ██", "██ ██ ██", "██ ████ ", "██      ", " ██████ "],
    _: ["        ", "        ", "        ", "        ", "        ", "████████"],
    " ": ["        ", "        ", "        ", "        ", "        ", "        "],
  };

  /**
   * Раскладывает текст в прямоугольную сетку on/off.
   * Неизвестные символы пропускаются, а не подменяются.
   */
  function buildGrid(text: string, letterSpacing: number): boolean[][] {
    const glyphs = text
      .toUpperCase()
      .split("")
      .map((ch) => FONT[ch])
      .filter((g): g is string[] => Boolean(g));

    if (glyphs.length === 0) return [];

    const gap = " ".repeat(Math.max(0, letterSpacing));
    const rows: boolean[][] = [];

    for (let row = 0; row < GLYPH_HEIGHT; row++) {
      const line = glyphs.map((g) => g[row]).join(gap);
      rows.push(line.split("").map((ch) => ch !== " "));
    }

    return rows;
  }

  /**
   * Чистая функция: рисует один кадр анимации в виде многострочной строки.
   * @param t время в секундах, уже умноженное на speed
   */
  function renderFrame(
    grid: boolean[][],
    mode: AsciiAnimation,
    t: number,
    ramp: string,
  ): string {
    const last = ramp.length - 1;
    const lit = ramp[last] ?? "█";
    const rows = grid.length;
    const width = grid[0]?.length ?? 0;

    const out: string[] = [];

    for (let y = 0; y < rows; y++) {
      let line = "";
      for (let x = 0; x < width; x++) {
        if (!grid[y][x]) {
          line += " ";
          continue;
        }

        switch (mode) {
          case "wave": {
            // Бегущая синусоида выбирает плотность символа из ramp.
            const v = (Math.sin(x * 0.18 - t * 3 + y * 0.25) + 1) / 2;
            line += ramp[Math.round(v * last)] ?? lit;
            break;
          }
          case "pulse": {
            const v = (Math.sin(t * 2.2) + 1) / 2;
            line += ramp[Math.round(v * last)] ?? lit;
            break;
          }
          case "scan": {
            // Яркая полоса движется сверху вниз по глифам.
            const band = ((t * 0.6) % 1) * rows;
            const d = Math.abs(y - band);
            const v = Math.max(0, 1 - d / 2);
            line += ramp[Math.round(v * last)] ?? lit;
            break;
          }
          case "glitch": {
            // Детерминированный хэш, чтобы шум не перемешивался каждый кадр.
            const seed =
              Math.sin(x * 12.9898 + y * 78.233 + Math.floor(t * 8)) *
              43758.5453;
            const n = seed - Math.floor(seed);

            // «Сбойные» ячейки должны быть строго темнее самой яркой ступени,
            // иначе они неотличимы от обычных и эффект не виден.
            if (n > 0.96) {
              line += " ";
            } else if (n > 0.82) {
              const dim = Math.floor(((n - 0.82) / 0.14) * last);
              line +=
                ramp[Math.min(Math.max(last - 1, 0), Math.max(0, dim))] ?? lit;
            } else {
              line += lit;
            }
            break;
          }
          case "typewriter": {
            const revealed = ((t * 12) % (width + 12)) | 0;
            line += x <= revealed ? lit : " ";
            break;
          }
          default:
            line += lit;
        }
      }
      out.push(line);
    }

    return out.join("\n");
  }
</script>

<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLDivElement>, "children" | "color"> & {
    /** Текст для отрисовки. Неподдерживаемые символы пропускаются. */
    text?: string;
    /** Тип анимации глифов. */
    animation?: AsciiAnimation;
    /** Множитель скорости анимации. */
    speed?: number;
    /** Размер глифов в px. Игнорируется при autoFit. */
    fontSize?: number;
    /** Масштабировать глифы так, чтобы строка занимала всю ширину контейнера. */
    autoFit?: boolean;
    /** Пустые колонки между буквами. */
    letterSpacing?: number;
    /** Любой CSS-цвет. По умолчанию наследуется цвет текста. */
    color?: string;
    /** Мягкое свечение за глифами. */
    glow?: boolean;
    /** Символы для «зажжённой» ячейки: от тёмного к светлому. */
    ramp?: string;
  };

  let {
    text = "OPENSOPHY",
    animation = "wave",
    speed = 1,
    fontSize = 14,
    autoFit = true,
    letterSpacing = 2,
    color,
    glow = false,
    ramp = DEFAULT_RAMP,
    class: className,
    ...rest
  }: Props = $props();

  let frame = $state("");
  let containerWidth = $state(0);

  const grid = $derived(buildGrid(text, letterSpacing));
  // Примитивы: эффект перезапускается только при смене формы сетки.
  const rowCount = $derived(grid.length);
  const cols = $derived(grid[0]?.length ?? 0);

  // Моноширинная ячейка ≈ 0.6em шириной.
  const fitSize = $derived(
    autoFit && cols > 0 && containerWidth > 0
      ? Math.max(4, containerWidth / (cols * 0.62))
      : null,
  );
  const size = $derived(autoFit ? (fitSize ?? fontSize) : fontSize);

  $effect(() => {
    // Явные зависимости: форма сетки и тип анимации.
    // speed, ramp и сама сетка читаются внутри rAF-колбэка и не отслеживаются,
    // поэтому смена speed на лету не перезапускает анимацию.
    const mode = animation;
    if (rowCount === 0 || cols === 0) {
      frame = "";
      return;
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let raf = 0;
    const start = performance.now();

    const render = (now: number) => {
      const t = reduceMotion ? 0 : ((now - start) / 1000) * speed;
      frame = renderFrame(grid, mode, t, ramp);

      if (mode !== "none" && !reduceMotion) {
        raf = requestAnimationFrame(render);
      }
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  });
</script>

<div
  bind:clientWidth={containerWidth}
  class={["w-full overflow-hidden", className]}
  role="img"
  aria-label={text}
  {...rest}
>
  <pre
    aria-hidden="true"
    class="m-0 w-full text-center font-mono leading-none whitespace-pre select-none"
    style:font-size="{size}px"
    style:color
    style:text-shadow={glow ? "0 0 0.5em currentColor" : undefined}>{frame}</pre>
</div>
