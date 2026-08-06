import palette from '@/constants/palette';

/**
 * Native + in-app splash gradient (lime → blue → purple).
 * Keep native splash image (`assets/images/splash-gradient.png`) in sync with these colors.
 */
export const SPLASH_GRADIENT = [
  palette.lime[400],
  palette.blue[500],
  palette.purpleScale[500],
] as const;

export const SPLASH_GRADIENT_START = { x: 1, y: 0 } as const;
export const SPLASH_GRADIENT_END = { x: 0.5, y: 1 } as const;
