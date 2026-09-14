/* ==========================================================================
   Stylised map of Wales
   --------------------------------------------------------------------------
   Coastlines are stored as [latitude, longitude] pairs and projected in the
   component, so the outline and the town markers always share one coordinate
   system. The outline is deliberately simplified: it is a graphic, not a
   survey.

   The towns below are drawn as connection points to illustrate the shape of
   the network ConnectCymru is setting out to build. They do not represent
   businesses, users or activity of any kind.
   ========================================================================== */

export type LatLon = [number, number];

/** Equirectangular projection tuned to the latitude of mid Wales. */
export const PROJECTION = {
  lonMin: -5.4,
  lonMax: -2.58,
  latMin: 51.33,
  latMax: 53.47,
  /** cos(52.4 degrees), so a degree of longitude reads at its true width. */
  lonScale: 0.61,
};

export const VIEW_WIDTH = 420;
export const VIEW_HEIGHT =
  Math.round(
    (VIEW_WIDTH * (PROJECTION.latMax - PROJECTION.latMin)) /
      ((PROJECTION.lonMax - PROJECTION.lonMin) * PROJECTION.lonScale),
  );

export function project([lat, lon]: LatLon): [number, number] {
  const { lonMin, lonMax, latMin, latMax } = PROJECTION;
  const x = ((lon - lonMin) / (lonMax - lonMin)) * VIEW_WIDTH;
  const y = ((latMax - lat) / (latMax - latMin)) * VIEW_HEIGHT;
  return [Number(x.toFixed(2)), Number(y.toFixed(2))];
}

/** Mainland Wales, clockwise from Bangor. */
export const mainland: LatLon[] = [
  [53.23, -4.13], [53.26, -3.97], [53.29, -3.83], [53.33, -3.87], [53.32, -3.79],
  [53.3, -3.71], [53.3, -3.58], [53.32, -3.49], [53.33, -3.41], [53.35, -3.32],
  [53.25, -3.13], [53.21, -3.02], [53.05, -2.93], [52.93, -3.06], [52.83, -3.03],
  [52.66, -3.09], [52.56, -3.13], [52.48, -3.08], [52.34, -3.04], [52.28, -2.99],
  [52.07, -3.12], [51.86, -2.99], [51.81, -2.71], [51.65, -2.68], [51.58, -2.78],
  [51.53, -2.99], [51.45, -3.17], [51.39, -3.27], [51.4, -3.56], [51.48, -3.71],
  [51.58, -3.8], [51.61, -3.93], [51.57, -3.98], [51.55, -4.17], [51.57, -4.33],
  [51.69, -4.2], [51.71, -4.32], [51.76, -4.47], [51.73, -4.61], [51.67, -4.7],
  [51.6, -4.94], [51.68, -5.1], [51.69, -5.19], [51.73, -5.24], [51.81, -5.13],
  [51.91, -5.3], [52.03, -5.07], [52.01, -4.97], [52.03, -4.83], [52.09, -4.66],
  [52.16, -4.47], [52.22, -4.36], [52.24, -4.26], [52.3, -4.16], [52.42, -4.08],
  [52.49, -4.05], [52.54, -4.05], [52.58, -4.09], [52.72, -4.06], [52.86, -4.11],
  [52.92, -4.13], [52.92, -4.23], [52.89, -4.41], [52.86, -4.48], [52.82, -4.5],
  [52.81, -4.57], [52.8, -4.63], [52.8, -4.71], [52.79, -4.77], [52.83, -4.76],
  [52.87, -4.71], [52.94, -4.57], [52.95, -4.52], [53.0, -4.42], [53.06, -4.37],
  [53.09, -4.33], [53.14, -4.27], [53.18, -4.2],
];

/** Ynys Mon / Anglesey, clockwise from Aberffraw. */
export const anglesey: LatLon[] = [
  [53.19, -4.46], [53.21, -4.49], [53.23, -4.51], [53.26, -4.57], [53.28, -4.61],
  [53.31, -4.63], [53.33, -4.68], [53.38, -4.68], [53.4, -4.61], [53.41, -4.52],
  [53.41, -4.45], [53.42, -4.36], [53.41, -4.29], [53.37, -4.26], [53.35, -4.24],
  [53.32, -4.22], [53.3, -4.06], [53.26, -4.09], [53.22, -4.16], [53.17, -4.26],
  [53.14, -4.33], [53.15, -4.42],
];

export type MapPoint = {
  name: string;
  at: LatLon;
  /** Which side of the dot the label sits on. */
  labelSide: 'left' | 'right';
  /**
   * Vertical nudge in view units. South Wales is a tight cluster, so several
   * labels are lifted or dropped by hand to keep them from colliding.
   */
  labelDy?: number;
};

export const mapPoints: MapPoint[] = [
  { name: 'Wrexham', at: [53.043, -2.9925], labelSide: 'left' },
  { name: 'Merthyr Tydfil', at: [51.7486, -3.3782], labelSide: 'left', labelDy: -4 },
  { name: 'Llanelli', at: [51.6836, -4.16], labelSide: 'left', labelDy: -9 },
  { name: 'Swansea', at: [51.6214, -3.9436], labelSide: 'left', labelDy: 4 },
  { name: 'Pontypridd', at: [51.6021, -3.3417], labelSide: 'right', labelDy: -10 },
  { name: 'Newport', at: [51.5842, -2.9977], labelSide: 'right', labelDy: 3 },
  { name: 'Bridgend', at: [51.5045, -3.5767], labelSide: 'left', labelDy: 4 },
  { name: 'Cardiff', at: [51.4816, -3.1791], labelSide: 'right', labelDy: 2 },
  { name: 'Barry', at: [51.399, -3.2683], labelSide: 'right', labelDy: 8 },
];

/** Index pairs into `mapPoints`, drawn as the connecting network lines. */
export const connections: Array<[number, number]> = [
  [0, 1],
  [1, 4],
  [4, 7],
  [7, 5],
  [7, 8],
  [6, 7],
  [3, 6],
  [2, 3],
  [1, 6],
];
