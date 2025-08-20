export interface NgxSmkButtonSpinnerTheme {
  /** Spinner color (any CSS color). Default: currentColor */
  color?: string;

  /** Spinner trail/track color. Default: transparent */
  trackColor?: string;

  /** Border thickness. Default: 2px */
  thickness?: string;

  /** Spinner size. Default: 1.2em */
  size?: string;

  /** Animation speed in ms. Default: 700 */
  speedMs?: number;

  /** Optional backdrop while loading (rgba recommended). Default: transparent */
  dimOverlay?: string;

  /** Keep label text visible while loading (overlay mode). Default: false */
  keepLabel?: boolean;
}

export interface NgxSmkButtonSpinnerOptions {
  /** ARIA label for the spinner; default 'Loading' */
  ariaLabel?: string;

  /** (future-proof) positioning mode; currently only 'overlay' */
  mode?: 'overlay';
}
