import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { HwSymbol } from '@/components/ui/hw-symbol';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import type { LocalityRatings } from '@/types/locality';

const RATING_ITEMS = [
  { id: 'transport', key: 'transport', emoji: '🚍', label: 'Transit' },
  { id: 'dining', key: 'dining', emoji: '🍽️', label: 'Dining' },
  { id: 'nightlife', key: 'nightlife', emoji: '🌙', label: 'Night Life' },
  { id: 'health', key: 'health', emoji: '🏥', label: 'Health' },
] as const;

function formatScore(value?: number) {
  if (value == null || !Number.isFinite(value)) return null;
  return value.toFixed(1);
}

export function LocalityRatingsGrid({ ratings }: { ratings?: LocalityRatings | null }) {
  const items = RATING_ITEMS.map((item) => ({
    ...item,
    score: formatScore(ratings?.[item.key]),
  })).filter((item) => item.score);

  if (items.length === 0) return null;

  return (
    <LinearGradient
      colors={[palette.blue[50], palette.purpleScale[50]]}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={styles.grid}>
      {items.map((item) => (
        <View key={item.id} style={styles.item}>
          <View style={styles.scoreRow}>
            <Typography variant="text" size="md" weight="bold" style={styles.score}>
              {item.score}
            </Typography>
            <HwSymbol name="star.fill" size={14} tintColor={palette.yellow[500]} />
          </View>

          <View style={styles.labelRow}>
            <Typography variant="text" size="xs" style={styles.emoji}>
              {item.emoji}
            </Typography>
            <Typography
              variant="text"
              size="xs"
              weight="medium"
              color={palette.gray[600]}
              numberOfLines={1}
              style={styles.label}>
              {item.label}
            </Typography>
          </View>
        </View>
      ))}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 14,
    overflow: 'hidden',
  },
  item: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    gap: 4,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  score: {
    includeFontPadding: false,
    lineHeight: 22,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    maxWidth: '100%',
  },
  emoji: {
    lineHeight: 16,
  },
  label: {
    flexShrink: 1,
    textAlign: 'center',
  },
});
