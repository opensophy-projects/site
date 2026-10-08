export type Orientation = 'horizontal' | 'vertical';
export type Align = 'start' | 'center';
export type ParallelAlign = 'start' | 'end';
export type JunctionMarker = 'none' | 'square';
export type RectLike = Pick<DOMRect, 'x' | 'y' | 'top' | 'left' | 'right' | 'bottom' | 'width' | 'height'>;
export type Connector = { x1: number; y1: number; x2: number; y2: number; disabled?: boolean };
export type NodeData = { element?: Element | null; disabled?: boolean; start?: RectLike | null; end?: RectLike | null };
export const rectEquals = (a?: RectLike | null, b?: RectLike | null) =>
  a === b || (!!a && !!b && ['x','y','top','left','right','bottom','width','height'].every((key) => a[key as keyof RectLike] === b[key as keyof RectLike]));
export const createRoundedPath = (connector: Connector, radius = 8) => {
  const { x1, y1, x2, y2 } = connector;
  if (Math.abs(x2 - x1) < 2) return `M ${x1} ${y1} L ${x2} ${y2}`;
  if (Math.abs(y2 - y1) < 2) return `M ${x1} ${y1} L ${x2} ${y2}`;
  const r = Math.min(radius, Math.abs(x2 - x1) / 2, Math.abs(y2 - y1) / 2);
  const midY = y1 + (y2 - y1) / 2;
  return `M ${x1} ${y1} L ${x1} ${midY - r} Q ${x1} ${midY} ${x1 + Math.sign(x2 - x1) * r} ${midY} L ${x2 - Math.sign(x2 - x1) * r} ${midY} Q ${x2} ${midY} ${x2} ${midY + r} L ${x2} ${y2}`;
};
