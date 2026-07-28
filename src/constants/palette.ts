/** HelloWorld revamp brand palette — from HW Brand Pitch + color swatches. */
const brand = {
  helloLime: '#69A30E',
  yellowWorld: '#FFC644',
  lightBlue: '#33B4F1',
  purple: '#6341D6',
  grey: '#1C1E23',
  error: '#D92D20',
} as const;

const lime = {
  25: '#FAFEF5',
  50: '#F7FEE7',
  100: '#D9F99E',
  200: '#D9F99E',
  300: '#BEF264',
  400: '#A3E635',
  500: '#84CC15',
  600: '#65A30C',
  700: '#4C7B0C',
  800: '#3E6111',
  900: '#365312',
} as const;

const yellow = {
  25: '#FFFBEE',
  50: '#FEFCE8',
  100: '#FEF9B9',
  200: '#FDE2A1',
  300: '#FDDBBA',
  400: '#FDD373',
  500: '#FCCC5B',
  600: '#FCC544',
  700: '#FBBD2C',
  800: '#FBB615',
  900: '#F3AA00',
} as const;

const gray = {
  25: '#FDFDFD',
  50: '#FAFAFA',
  100: '#F5F5F5',
  200: '#E8EAEB',
  300: '#D5D7DA',
  400: '#A4A7AE',
  500: '#717880',
  600: '#535862',
  700: '#414651',
  800: '#252B37',
  900: '#101828',
} as const;

const red = {
  25: '#FFFBFA',
  50: '#FEF3F2',
  100: '#FEE4E2',
  200: '#FECDCA',
  300: '#FDA29B',
  400: '#F97066',
  500: '#F04438',
  600: '#D92D20',
  700: '#B42318',
  800: '#912018',
  900: '#7A271A',
} as const;

const blue = {
  25: '#F5FBFF',
  50: '#F0F9FF',
  100: '#E0F2FE',
  200: '#B9E6FE',
  300: '#7CD4FD',
  400: '#38BFF8',
  500: '#0BA5EC',
  600: '#0086C9',
  700: '#026AA2',
  800: '#065986',
  900: '#0B4A6F',
} as const;

const purpleScale = {
  25: '#FCFAFF',
  50: '#F9F5FF',
  100: '#F4EBFF',
  200: '#E9D7FE',
  300: '#D6BBFB',
  400: '#B692F6',
  500: '#9E77ED',
  600: '#7F56D9',
  700: '#6941C6',
  800: '#53389E',
  900: '#42307D',
} as const;

/** All swatch weights (25–900) shared across color scales. */
export const COLOR_WEIGHTS = [25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

export type ColorWeight = (typeof COLOR_WEIGHTS)[number];

export const COLOR_SCALES = {
  lime,
  yellow,
  gray,
  red,
  blue,
  purple: purpleScale,
} as const;

export type ColorScaleName = keyof typeof COLOR_SCALES;

export default {
  ...brand,
  white: '#FFFFFF',
  black: '#000000',
  lime,
  yellow,
  gray,
  red,
  blue,
  purpleScale,
  // Semantic aliases (used across screens)
  green: brand.helloLime,
  lightGreen: lime[50],
  grey600: gray[600],
  grey800: gray[800],
  grey900: gray[900],
  lightBlue: brand.lightBlue,
  primeBlue: blue[900],
  offWhite300: gray[50],
  // Input / form tokens
  textPrimary: gray[900],
  textSecondary: gray[600],
  textPlaceholder: gray[500],
  textLabel: gray[700],
  borderDefault: gray[300],
  borderError: red[600],
  focusRing: lime[100],
  surfaceDisabled: gray[100],
  // Home screen background gradient (Figma: #252B37 → #3B4760, top to bottom)
  homeGradientTop: gray[800],
  homeGradientBottom: '#3B4760',
  // HDP vibe match card (Figma linear gradients)
  vibeMatchCardGradientStart: '#D2F0FE',
  vibeMatchCardGradientEnd: '#E9D7FE',
} as const;
