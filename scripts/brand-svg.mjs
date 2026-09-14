/* Shared vector building blocks for the generated brand assets. */

export const INK = '#171A1C';
export const PAPER = '#F5F3EE';
export const RED = '#C8102E';
export const ORANGE = '#D66A2C';

/**
 * The ConnectCymru mark, drawn on a 28x28 grid and scaled into place.
 * Mirrors src/components/brand/Mark.tsx: keep the two in step.
 */
export function mark({ x = 0, y = 0, size = 28, color = INK, junction = color } = {}) {
  const s = size / 28;
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M5 9h8l10 10" stroke="${color}" stroke-width="2.25" stroke-linecap="square" fill="none"/>
    <rect x="1.5" y="5.5" width="7" height="7" fill="${color}"/>
    <rect x="19.5" y="15.5" width="7" height="7" fill="${color}"/>
    <rect x="10.75" y="6.75" width="4.5" height="4.5" fill="${junction}"/>
  </g>`;
}

/** Favicon artwork: the mark centred in a charcoal tile. */
export function faviconSvg(size = 64) {
  const markSize = size * 0.62;
  const offset = (size - markSize) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.09}" fill="${INK}"/>
  ${mark({ x: offset, y: offset, size: markSize, color: PAPER, junction: RED })}
</svg>`;
}

/** 1200x630 social share card. */
export function ogSvg() {
  const W = 1200;
  const H = 630;
  const PAD = 80;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${INK}"/>

  <!-- Routed connection motif, enlarged along the right edge -->
  <g opacity="0.16" stroke="${PAPER}" stroke-width="2" fill="none">
    <path d="M760 ${H} L920 ${H - 160} L920 -40"/>
    <path d="M880 ${H} L1040 ${H - 160} L1040 -40"/>
    <path d="M1000 ${H} L1160 ${H - 160} L1160 -40"/>
  </g>

  <!-- Welsh red rule across the top -->
  <rect x="0" y="0" width="${W}" height="6" fill="${RED}"/>

  <!-- Wordmark -->
  ${mark({ x: PAD, y: 78, size: 30, color: PAPER, junction: RED })}
  <text x="${PAD + 44}" y="103" font-family="Inter" font-size="27" fill="${PAPER}">
    <tspan font-weight="500">Connect</tspan><tspan font-weight="700">Cymru</tspan>
  </text>

  <!-- Headline -->
  <text x="${PAD}" y="300" font-family="Inter" font-weight="600" font-size="82" letter-spacing="-2.6" fill="${PAPER}">Connecting Welsh<tspan x="${PAD}" dy="92">industry<tspan fill="${RED}">.</tspan></tspan></text>

  <!-- Supporting line -->
  <text x="${PAD}" y="462" font-family="Inter" font-weight="400" font-size="26" fill="#9AA0A4">Surplus materials, matched with the businesses that can use them.</text>

  <!-- Launch label -->
  <rect x="${PAD}" y="${H - 108}" width="10" height="10" fill="${ORANGE}"/>
  <text x="${PAD + 26}" y="${H - 98}" font-family="Inter" font-weight="600" font-size="16" letter-spacing="2.6" fill="${PAPER}">LAUNCHING SOON</text>
</svg>`;
}
