import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { VibeChip, type VibeChipVariant } from '@/components/vibe/vibe-chip';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import type { VibeId } from '@/constants/vibes';

export type VibeListItem = {
  id: string;
  label: string;
  emoji: string;
};

type VibeSelectionListProps = {
  vibes: readonly VibeListItem[];
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
  variant?: VibeChipVariant;
  multiple?: boolean;
  maxSelection?: number;
  onMaxReached?: () => void;
  hint?: ReactNode;
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export function VibeSelectionList({
  vibes,
  selectedIds,
  onChange,
  variant = 'onDark',
  multiple = true,
  maxSelection,
  onMaxReached,
  hint,
  scrollable = true,
  style,
  contentContainerStyle,
}: VibeSelectionListProps) {
  function toggleVibe(id: string) {
    const isSelected = selectedIds.includes(id);

    if (multiple) {
      if (!isSelected && maxSelection && selectedIds.length >= maxSelection) {
        onMaxReached?.();
        return;
      }
      onChange(isSelected ? selectedIds.filter((v) => v !== id) : [...selectedIds, id]);
      return;
    }

    onChange(isSelected ? [] : [id]);
  }

  const chips = vibes.map((vibe) => (
    <VibeChip
      key={vibe.id}
      label={vibe.label}
      emoji={vibe.emoji}
      selected={selectedIds.includes(vibe.id)}
      onPress={() => toggleVibe(vibe.id)}
      variant={variant}
    />
  ));

  return (
    <View style={style}>
      {hint ? (
        <View style={styles.hint}>
          {typeof hint === 'string' ? (
            <Typography
              variant="text"
              size="xs"
              color={variant === 'onDark' ? palette.gray[300] : palette.textSecondary}>
              {hint}
            </Typography>
          ) : (
            hint
          )}
        </View>
      ) : null}

      {scrollable ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          // Keep scale-spring / check-badge from being clipped by the scroll viewport.
          clipToPadding={false}
          style={styles.scroll}
          contentContainerStyle={[styles.row, contentContainerStyle]}>
          {chips}
        </ScrollView>
      ) : (
        <View style={[styles.wrap, contentContainerStyle]}>{chips}</View>
      )}
    </View>
  );
}

/** Type-safe helper when using `VIBE_OPTIONS` ids. */
export function isVibeId(id: string): id is VibeId {
  return ['chill', 'creative', 'fitness', 'gaming'].includes(id);
}

const styles = StyleSheet.create({
  hint: {
    marginBottom: 8,
  },
  scroll: {
    overflow: 'visible',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 4,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
