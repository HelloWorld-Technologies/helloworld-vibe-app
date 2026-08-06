import { Platform, type TextStyle } from 'react-native';

/** Satoshi type scale from brand typography guidelines. */
export const TypeScale = {
  display: {
    '2xl': { fontSize: 72, lineHeight: 90, letterSpacing: -1.44 },
    xl: { fontSize: 60, lineHeight: 72, letterSpacing: -1.2 },
    lg: { fontSize: 48, lineHeight: 60, letterSpacing: -0.96 },
    md: { fontSize: 36, lineHeight: 44, letterSpacing: -0.72 },
    sm: { fontSize: 30, lineHeight: 38 },
    xs: { fontSize: 24, lineHeight: 32 },
  },
  text: {
    xl: { fontSize: 20, lineHeight: 30 },
    lg: { fontSize: 18, lineHeight: 28 },
    md: { fontSize: 16, lineHeight: 24 },
    sm: { fontSize: 14, lineHeight: 20 },
    xs: { fontSize: 12, lineHeight: 18 },
  },
} as const;

/**
 * iOS: Satoshi Variable + fontWeight axis.
 * Android: static faces — variable fonts ignore fontWeight and fall back to Roboto.
 */
export const Fonts = {
  satoshi: 'Satoshi Variable',
  light: 'Satoshi-Light',
  regular: 'Satoshi-Regular',
  medium: 'Satoshi-Medium',
  bold: 'Satoshi-Bold',
  black: 'Satoshi-Black',
} as const;

export const FontAssets = {
  [Fonts.satoshi]: require('../../assets/fonts/Satoshi-Variable.ttf'),
  [Fonts.light]: require('../../assets/fonts/Satoshi-Light.ttf'),
  [Fonts.regular]: require('../../assets/fonts/Satoshi-Regular.ttf'),
  [Fonts.medium]: require('../../assets/fonts/Satoshi-Medium.ttf'),
  [Fonts.bold]: require('../../assets/fonts/Satoshi-Bold.ttf'),
  [Fonts.black]: require('../../assets/fonts/Satoshi-Black.ttf'),
} as const;

/** CSS-style weight names mapped to Satoshi weights. */
export const FONT_WEIGHTS = [
  'thin',
  'extralight',
  'light',
  'regular',
  'medium',
  'semibold',
  'bold',
  'extrabold',
  'black',
] as const;

export type FontWeight = (typeof FONT_WEIGHTS)[number];

/** Numeric CSS weight for each token (iOS / web variable axis). */
export const FONT_WEIGHT_VALUES: Record<FontWeight, TextStyle['fontWeight']> = {
  thin: '100',
  extralight: '200',
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
};

const ANDROID_FAMILY_BY_WEIGHT: Record<FontWeight, string> = {
  thin: Fonts.light,
  extralight: Fonts.light,
  light: Fonts.light,
  regular: Fonts.regular,
  medium: Fonts.medium,
  semibold: Fonts.bold,
  bold: Fonts.bold,
  extrabold: Fonts.black,
  black: Fonts.black,
};

/** @deprecated Use `fontStyleForWeight` — kept for legacy imports. */
export function fontFamilyForWeight(weight: FontWeight = 'regular'): string {
  return Platform.OS === 'android' ? ANDROID_FAMILY_BY_WEIGHT[weight] : Fonts.satoshi;
}

/**
 * Cross-platform Satoshi styles.
 * iOS: variable family + numeric weight.
 * Android: static face for that weight + fontWeight normal.
 */
export function fontStyleForWeight(weight: FontWeight = 'regular'): TextStyle {
  if (Platform.OS === 'android') {
    return {
      fontFamily: ANDROID_FAMILY_BY_WEIGHT[weight],
      fontWeight: 'normal',
      fontStyle: 'normal',
    };
  }

  return {
    fontFamily: Fonts.satoshi,
    fontWeight: FONT_WEIGHT_VALUES[weight],
    fontStyle: 'normal',
  };
}
