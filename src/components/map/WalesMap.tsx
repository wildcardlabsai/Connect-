import type { CSSProperties } from 'react';
import {
  VIEW_HEIGHT,
  VIEW_WIDTH,
  anglesey,
  connections,
  mainland,
  mapPoints,
  project,
} from '../../data/wales';
import type { LatLon } from '../../data/wales';
import { useInView } from '../../lib/useInView';
import './WalesMap.css';

/**
 * Converts a ring of points into a closed, smoothed path using Catmull-Rom
 * segments expressed as cubic beziers. The slight tension keeps headlands
 * readable instead of rounding the coast into a blob.
 */
function closedSpline(points: LatLon[], tension = 0.85): string {
  const pts = points.map(project);
  const n = pts.length;
  if (n < 3) return '';

  const at = (i: number) => pts[(i + n) % n];
  let d = `M${at(0)[0]} ${at(0)[1]}`;

  for (let i = 0; i < n; i += 1) {
    const [x0, y0] = at(i - 1);
    const [x1, y1] = at(i);
    const [x2, y2] = at(i + 1);
    const [x3, y3] = at(i + 2);

    const c1x = x1 + ((x2 - x0) / 6) * tension;
    const c1y = y1 + ((y2 - y0) / 6) * tension;
    const c2x = x2 - ((x3 - x1) / 6) * tension;
    const c2y = y2 - ((y3 - y1) / 6) * tension;

    d += ` C${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${x2.toFixed(2)} ${y2.toFixed(2)}`;
  }

  return `${d}Z`;
}

const MAINLAND_PATH = closedSpline(mainland, 0.72);
const ANGLESEY_PATH = closedSpline(anglesey, 0.72);
const PROJECTED_POINTS = mapPoints.map((point) => ({ ...point, xy: project(point.at) }));

export function WalesMap() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.2 });

  return (
    <div ref={ref} className={`wales${inView ? ' is-live' : ''}`}>
      <svg
        className="wales__svg"
        viewBox={`-16 -16 ${VIEW_WIDTH + 32} ${VIEW_HEIGHT + 32}`}
        role="img"
        aria-labelledby="wales-map-title wales-map-desc"
      >
        <title id="wales-map-title">Stylised map of Wales</title>
        <desc id="wales-map-desc">
          An outline of Wales with connection points marked at Wrexham, Merthyr Tydfil,
          Llanelli, Swansea, Pontypridd, Newport, Bridgend, Cardiff and Barry, joined by
          lines. The points illustrate the network ConnectCymru intends to build and do
          not represent businesses or activity.
        </desc>

        <defs>
          <pattern
            id="wales-grid"
            width="14"
            height="14"
            patternUnits="userSpaceOnUse"
          >
            <path d="M14 0H0V14" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.16" />
          </pattern>
          <clipPath id="wales-clip">
            <path d={MAINLAND_PATH} />
            <path d={ANGLESEY_PATH} />
          </clipPath>
        </defs>

        {/* Landmass */}
        <g className="wales__land">
          <path d={MAINLAND_PATH} />
          <path d={ANGLESEY_PATH} />
        </g>

        {/* Fine grid, clipped to the land so it reads as a survey drawing */}
        <g clipPath="url(#wales-clip)" className="wales__grid">
          <rect x="-16" y="-16" width={VIEW_WIDTH + 32} height={VIEW_HEIGHT + 32} fill="url(#wales-grid)" />
        </g>

        {/* Coastline */}
        <g className="wales__coast">
          <path d={MAINLAND_PATH} />
          <path d={ANGLESEY_PATH} />
        </g>

        {/* Connection lines between points */}
        <g className="wales__links">
          {connections.map(([a, b], index) => {
            const [x1, y1] = PROJECTED_POINTS[a].xy;
            const [x2, y2] = PROJECTED_POINTS[b].xy;
            return (
              <line
                key={`${a}-${b}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                style={{ '--i': index } as CSSProperties}
              />
            );
          })}
        </g>

        {/* Connection points */}
        <g className="wales__points">
          {PROJECTED_POINTS.map((point, index) => {
            const [x, y] = point.xy;
            const toLeft = point.labelSide === 'left';
            return (
              <g key={point.name} style={{ '--i': index } as CSSProperties}>
                <circle className="wales__halo" cx={x} cy={y} r="9" />
                <circle className="wales__dot" cx={x} cy={y} r="3.1" />
                <text
                  className="wales__label"
                  x={toLeft ? x - 10 : x + 10}
                  y={y + 3.4 + (point.labelDy ?? 0)}
                  textAnchor={toLeft ? 'end' : 'start'}
                >
                  {point.name}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
