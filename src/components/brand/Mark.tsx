type MarkProps = {
  /** Rendered pixel size. The mark is drawn on a 28x28 grid. */
  size?: number;
  /**
   * Picks out the junction node in Welsh red. Off by default so the mark
   * stays a single-colour shape that works in black, white or red.
   */
  accented?: boolean;
  className?: string;
};

/**
 * The ConnectCymru mark.
 *
 * Two nodes joined by a routed line with a junction square where the route
 * turns: one business, one connection point, another business. Purely
 * geometric, single colour, legible down to 16px.
 */
export function Mark({ size = 28, accented = false, className }: MarkProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M5 9h8l10 10"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="square"
      />
      <rect x="1.5" y="5.5" width="7" height="7" fill="currentColor" />
      <rect x="19.5" y="15.5" width="7" height="7" fill="currentColor" />
      <rect
        x="10.75"
        y="6.75"
        width="4.5"
        height="4.5"
        fill={accented ? 'var(--c-red)' : 'currentColor'}
      />
    </svg>
  );
}
