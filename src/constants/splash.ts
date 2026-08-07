import palette from '@/constants/palette';

/**
 * Native + in-app splash gradient (lime → blue → purple).
 * Image asset: `assets/images/splash-gradient.png` (also copied to Android
 * `drawable-nodpi/splashscreen_full.png` via `with-android-splash-gradient`).
 *
 * Note: Android 12+ system splash API only allows a solid color + icon.
 * Our Android plugin overlays `splashscreen_full` and dismisses that system
 * splash immediately so the gradient is visible during launch. The in-app
 * splash uses the same colors via LinearGradient.
 */
export const SPLASH_GRADIENT = [
  palette.lime[400],
  palette.blue[500],
  palette.purpleScale[500],
] as const;

export const SPLASH_GRADIENT_START = { x: 1, y: 0 } as const;
export const SPLASH_GRADIENT_END = { x: 0.5, y: 1 } as const;
