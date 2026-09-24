/**
 * Цветные SVG-иллюстрации для секции «Услуги» — показываются на слабых
 * устройствах вместо ASCII-рендера (тонкие серые линии + акцент, как раньше).
 *
 * Положить в: apps/web/src/lib/utils/servicesFallback.ts
 */

const GRAY = "#8a8a96"; // приглушённые линии
const DARK = "#34343c"; // тёмно-серые столбики
const LIGHT = "#e4e4ea"; // светлые контуры (лупа)
const ACCENT = "#f43f5e"; // акцент сайта

const toUrl = (svg: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

const wrap = (viewBox: string, body: string, par = "xMidYMid meet") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" preserveAspectRatio="${par}">${body}</svg>`;

// ── Общие данные (используются и ASCII-версией) ─────────────────────
export const BAR_HEIGHTS = [
  55, 40, 70, 45, 90, 60, 35, 80, 50, 75, 42, 88, 30, 65, 48, 92, 38, 72, 55,
  85, 44, 68, 36, 78, 52, 62, 47, 58,
];
export const ACCENT_BARS = new Set([4, 9, 12, 18, 23, 26]);

/** Контур шестерни по кругу */
export function buildGearPath(
  cx: number,
  cy: number,
  teeth: number,
  rOuter: number,
  rInner: number,
): string {
  const step = (Math.PI * 2) / teeth;
  const a = step * 0.18;
  const b = step * 0.32;
  const c = step * 0.68;
  const d = step * 0.82;
  const pts: string[] = [];
  for (let i = 0; i < teeth; i++) {
    const base = i * step - Math.PI / 2;
    const seq: [number, number][] = [
      [base + a, rInner],
      [base + b, rOuter],
      [base + c, rOuter],
      [base + d, rInner],
    ];
    for (const [ang, r] of seq) {
      pts.push(
        `${(cx + Math.cos(ang) * r).toFixed(2)} ${(cy + Math.sin(ang) * r).toFixed(2)}`,
      );
    }
  }
  return `M${pts.join(" L")} Z`;
}

// ── Щит ─────────────────────────────────────────────────────────────
const shield = wrap(
  "40 28 120 132",
  `<path d="M100 44 L138 57 L138 95 C138 120 120 138 100 148 C80 138 62 120 62 95 L62 57 Z" fill="none" stroke="${GRAY}" stroke-width="2.5" stroke-linejoin="round"/>
   <path d="M100 52 L132 63 L132 95 C132 116 116 132 100 141 C84 132 68 116 68 95 L68 63 Z" fill="none" stroke="${GRAY}" stroke-opacity=".45" stroke-width="1.5" stroke-linejoin="round"/>
   <path d="M82 98 L95 112 L120 84" fill="none" stroke="${ACCENT}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`,
);

// ── Проверка безопасности: дуги + вертикаль ─────────────────────────
const pentest = wrap(
  "0 0 450 152",
  `<rect x="224.25" y="0" width="1.5" height="152" fill="${GRAY}" fill-opacity=".6"/>
   <path d="M225 19.2 A273 273 0 0 0 225 565.2" fill="none" stroke="${GRAY}" stroke-opacity=".6" stroke-width="1.5"/>
   <path d="M225 56 A225 225 0 0 1 225 506" fill="none" stroke="${GRAY}" stroke-opacity=".6" stroke-width="1.5"/>
   <path d="M225 19.2 A273 273 0 0 1 225 565.2" fill="none" stroke="${ACCENT}" stroke-width="2"/>
   <path d="M225 56 A225 225 0 0 0 225 506" fill="none" stroke="${ACCENT}" stroke-width="2"/>`,
  "xMidYMid slice",
);

// ── Code review: столбики ───────────────────────────────────────────
const bars = (() => {
  const padX = 20;
  const baseY = 146;
  const maxH = 122;
  const slot = (450 - padX * 2) / BAR_HEIGHTS.length;
  const bw = 9;
  const rects = BAR_HEIGHTS.map((h, i) => {
    const bh = (h / 100) * maxH;
    const x = padX + i * slot + (slot - bw) / 2;
    const fill = ACCENT_BARS.has(i) ? ACCENT : DARK;
    return `<rect x="${x.toFixed(2)}" y="${(baseY - bh).toFixed(2)}" width="${bw}" height="${bh.toFixed(2)}" rx="1.5" fill="${fill}"/>`;
  }).join("");
  return wrap("0 0 450 152", rects);
})();

// ── Лупа ────────────────────────────────────────────────────────────
const leak = wrap(
  "30 10 130 130",
  `<circle cx="74" cy="60" r="33" fill="none" stroke="${LIGHT}" stroke-width="5"/>
   <path d="M58 52H90" stroke="${ACCENT}" stroke-width="2.5" stroke-linecap="round"/>
   <path d="M58 62H84" stroke="${GRAY}" stroke-width="2.5" stroke-linecap="round"/>
   <path d="M58 72H76" stroke="${GRAY}" stroke-width="2.5" stroke-linecap="round"/>
   <path d="M98 84 L134 120" stroke="${LIGHT}" stroke-width="9" stroke-linecap="round"/>
   <path d="M50 44C55 36 63 32 71 31" stroke="${ACCENT}" stroke-width="2.5" stroke-linecap="round" fill="none"/>`,
);

// ── Консультация: серое облачко (вопрос) + акцентное (ответ) ────────
const consult = wrap(
  "0 0 220 150",
  `<g transform="translate(-4 -6)">
     <path fill="none" stroke="${LIGHT}" stroke-width="2" d="M22 18H112C118.6 18 124 23.4 124 30V58C124 64.6 118.6 70 112 70H52L34 84V70H22C15.4 70 10 64.6 10 58V30C10 23.4 15.4 18 22 18Z"/>
     <text x="28" y="51" font-family="ui-monospace, monospace" font-size="22" font-weight="700" fill="${LIGHT}">?</text>
     <path d="M56 36C62 32 68 40 74 36C80 32 86 40 92 36C98 32 104 40 110 36" stroke="${GRAY}" stroke-width="1.8" stroke-linecap="round" fill="none"/>
     <path d="M56 52C62 48 68 56 74 52C80 48 86 56 92 52" stroke="${GRAY}" stroke-width="1.8" stroke-linecap="round" fill="none"/>
   </g>
   <g transform="translate(4 16)">
     <path fill="${ACCENT}" fill-opacity=".16" stroke="${ACCENT}" stroke-width="2" d="M108 62H198C204.6 62 210 67.4 210 74V102C210 108.6 204.6 114 198 114H186V128L168 114H108C101.4 114 96 108.6 96 102V74C96 67.4 101.4 62 108 62Z"/>
     <path d="M112 80C118 76 124 84 130 80C136 76 142 84 148 80C154 76 160 84 166 80C172 76 178 84 184 80C190 76 194 82 198 80" stroke="${ACCENT}" stroke-width="1.8" stroke-linecap="round" fill="none"/>
     <path d="M112 96C118 92 124 100 130 96C136 92 142 100 148 96C154 92 160 100 166 96" stroke="${ACCENT}" stroke-width="1.8" stroke-linecap="round" fill="none"/>
   </g>`,
);

// ── Шестерня ────────────────────────────────────────────────────────
const gear = wrap(
  "10 10 180 180",
  `<path d="${buildGearPath(100, 100, 12, 72, 58)}" fill="none" stroke="${GRAY}" stroke-width="3" stroke-linejoin="round"/>
   <circle cx="100" cy="100" r="34" fill="none" stroke="${GRAY}" stroke-opacity=".5" stroke-width="2"/>
   <circle cx="100" cy="100" r="20" fill="${ACCENT}" fill-opacity=".16" stroke="${ACCENT}" stroke-width="3"/>
   <circle cx="100" cy="100" r="6" fill="${ACCENT}"/>`,
);

export const fallbackVisuals = {
  shield: toUrl(shield),
  pentest: toUrl(pentest),
  review: toUrl(bars),
  leak: toUrl(leak),
  consult: toUrl(consult),
  gear: toUrl(gear),
};
