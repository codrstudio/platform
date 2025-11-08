/**
 * DashboardGrid Component
 *
 * SPEC Compliance: SPEC-DASH-G-*
 */

import { cn } from '@/lib/utils';
import type { Widget, GridPosition } from '../types';

export interface DashboardGridProps {
  widgets: Widget[];
  gridColumns?: number;
  children: (widget: Widget) => React.ReactNode;
  className?: string;
}

export function DashboardGrid({
  widgets,
  gridColumns = 12,
  children,
  className
}: DashboardGridProps) {
  // Calculate grid rows needed
  const maxRow = Math.max(0, ...widgets.map(w => w.position.y + w.position.h));

  return (
    <div
      className={cn('relative w-full', className)}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
        gridTemplateRows: `repeat(${maxRow}, minmax(100px, auto))`,
        gap: '1rem'
      }}
    >
      {widgets.map(widget => (
        <div
          key={widget.id}
          style={{
            gridColumn: `${widget.position.x + 1} / span ${widget.position.w}`,
            gridRow: `${widget.position.y + 1} / span ${widget.position.h}`
          }}
          className="min-h-0"
        >
          {children(widget)}
        </div>
      ))}
    </div>
  );
}

export function getGridPosition(
  x: number,
  y: number,
  w: number,
  h: number
): GridPosition {
  return { x, y, w, h };
}

export function validateGridPosition(
  position: GridPosition,
  gridColumns: number
): boolean {
  return (
    position.x >= 0 &&
    position.y >= 0 &&
    position.w > 0 &&
    position.h > 0 &&
    position.x + position.w <= gridColumns
  );
}
