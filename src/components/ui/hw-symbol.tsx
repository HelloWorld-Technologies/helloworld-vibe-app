import { SymbolView, type SymbolViewProps } from 'expo-symbols';

import { resolvePlatformSymbol } from '@/constants/symbols';

/**
 * Drop-in for expo-symbols `SymbolView` that maps SF Symbol string names
 * to Material Symbols on Android/web.
 */
export function HwSymbol({ name, ...props }: SymbolViewProps) {
  return <SymbolView name={resolvePlatformSymbol(name)} {...props} />;
}
