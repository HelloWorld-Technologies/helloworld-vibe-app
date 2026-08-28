import { Pressable, StyleSheet, View } from 'react-native';
import { HwSymbol } from '@/components/ui/hw-symbol';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Typography } from '@/components/ui/typography';
import { SrpIcons } from '@/constants/assets';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';

/** Matches helloworld-vibe `srpSortingOptions`. */
export const SORT_OPTIONS = ['popularity', 'price-asc', 'price-desc'] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

const FilterIcon = SrpIcons.filter;

const SORT_LABELS: Record<SortOption, string> = {
  popularity: 'Popularity',
  'price-asc': 'Price: Low to High',
  'price-desc': 'Price: High to Low',
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
        style={({ pressed }) => [styles.filtersButton, pressed && styles.buttonPressed]}
        accessibilityRole="button"
        accessibilityLabel="Filters">
        <FilterIcon width={20} height={20} color={palette.gray[700]} />
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
        style={({ pressed }) => [styles.sortButton, pressed && styles.buttonPressed]}
        accessibilityRole="button"
        accessibilityLabel={`Sort by ${SORT_LABELS[sort]}`}>
        <Typography
          variant="text"
          size="md"
          weight="bold"
          color={palette.gray[800]}
          numberOfLines={1}
          style={styles.sortText}>
          Sort By:{' '}
          <Typography variant="text" size="md" weight="bold" color={palette.lime[700]}>
            {SORT_LABELS[sort]}
          </Typography>
        </Typography>
        <View style={styles.sortChevron}>
          <HwSymbol name="chevron.down" size={14} weight="semibold" tintColor={palette.gray[800]} />
        </View>
      </Pressable>
    </View>
  );
}

export function nextSortOption(current: SortOption): SortOption {
  const index = SORT_OPTIONS.indexOf(current);
  return SORT_OPTIONS[(index + 1) % SORT_OPTIONS.length];
}

export function SrpSortSheet({
  visible,
  sort,
  onClose,
  onSelect,
}: {
  visible: boolean;
  sort: SortOption;
  onClose: () => void;
  onSelect: (sort: SortOption) => void;
}) {
  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.sheet}>
        <Typography variant="text" size="lg" weight="bold">
          Sort by
        </Typography>
        {SORT_OPTIONS.map((option) => {
          const selected = option === sort;
          return (
            <Pressable
              key={option}
              onPress={() => {
                onSelect(option);
                onClose();
              }}
              style={[styles.sortRow, selected && styles.sortRowSelected]}
              accessibilityRole="button"
              accessibilityState={{ selected }}>
              <Typography
                variant="text"
                size="md"
                weight={selected ? 'bold' : 'medium'}
                color={selected ? palette.lime[800] : palette.gray[800]}>
                {SORT_LABELS[option]}
              </Typography>
              {selected ? (
                <HwSymbol name="checkmark" size={16} weight="bold" tintColor={palette.lime[700]} />
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </BottomSheet>
  );
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
  filtersButton: {
    flexGrow: 0,
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 48,
    paddingHorizontal: 14,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: palette.gray[300],
    backgroundColor: palette.white,
  },
  sortButton: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 48,
    paddingHorizontal: 10,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: palette.gray[300],
    backgroundColor: palette.white,
  },
  sortText: {
    flex: 1,
    minWidth: 0,
  },
  sortChevron: {
    flexShrink: 0,
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
  sheet: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 8,
  },
  sortRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderRadius: Radius.sm,
  },
  sortRowSelected: {
    backgroundColor: palette.lime[50],
  },
});
