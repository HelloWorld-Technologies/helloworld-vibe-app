import { useWindowDimensions } from 'react-native';

/** Shortest side ≥ 600pt (iPad / large tablets). */
export function useIsTablet() {
  const { width, height } = useWindowDimensions();
  return Math.min(width, height) >= 600;
}
