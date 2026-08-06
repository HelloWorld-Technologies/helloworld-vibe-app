import { Pressable, StyleSheet, View } from 'react-native';
import { HwSymbol } from '@/components/ui/hw-symbol';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';

export const SORT_OPTIONS = ['distance', 'price', 'rating'] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

const SORT_LABELS: Record<SortOption, string> = {
  distance: 'Distance',
  price: 'Price',
  rating: 'Rating',
};

type SrpFilterSortBarProps = {
  sort: SortOption;
  activeFilterCount?: number;
  onPressFilters: () => void;
  onPressSort: () => void;
};

export function SrpFilterSortBar({
  sort,
  activeFilterCount = 0,
  onPressFilters,
  onPressSort,
}: SrpFilterSortBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <Pressable
        onPress={onPressFilters}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        accessibilityRole="button"
        accessibilityLabel="Filters">
        <HwSymbol name="line.3.horizontal.decrease" size={18} tintColor={palette.gray[800]} />
        <Typography variant="text" size="md" weight="bold" color={palette.gray[800]}>
          Filters
        </Typography>
        {activeFilterCount > 0 ? (
          <View style={styles.badge}>
            <Typography variant="text" size="xs" weight="bold" color={palette.white}>
              {activeFilterCount}
            </Typography>
          </View>
        ) : null}
      </Pressable>

      <Pressable
        onPress={onPressSort}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        accessibilityRole="button"
        accessibilityLabel={`Sort by ${SORT_LABELS[sort]}`}>
        <Typography variant="text" size="md" weight="bold" color={palette.gray[800]}>
          Sort By:{' '}
        </Typography>
        <Typography variant="text" size="md" weight="bold" color={palette.lime[700]}>
          {SORT_LABELS[sort]}
        </Typography>
        <HwSymbol name="chevron.down" size={14} weight="semibold" tintColor={palette.gray[800]} />
      </Pressable>
    </View>
  );
}

export function nextSortOption(current: SortOption): SortOption {
  const index = SORT_OPTIONS.indexOf(current);
  return SORT_OPTIONS[(index + 1) % SORT_OPTIONS.length];
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: palette.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.gray[200],
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 48,
    paddingHorizontal: 12,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: palette.gray[300],
    backgroundColor: palette.white,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: palette.lime[700],
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
});
