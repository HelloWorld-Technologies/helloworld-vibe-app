import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { HwSymbol } from '@/components/ui/hw-symbol';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import type { LocalityRatings } from '@/types/locality';

/** Figma locality ratings card — 16px radius, dual linear gradients. */
const LOCALITY_RATINGS_RADIUS = 16;
const LOCALITY_RATINGS_GRADIENT_SOFT_BLUE = '#D5ECF9';

const RATING_ITEMS = [
  { id: 'transit', keys: ['transit', 'transport'] as const, emoji: '🚍', label: 'Transit' },
  { id: 'dining', keys: ['dining'] as const, emoji: '🍽️', label: 'Dining' },
  { id: 'nightlife', keys: ['night_life', 'nightlife'] as const, emoji: '🌙', label: 'Night Life' },
  { id: 'health', keys: ['health'] as const, emoji: '🏥', label: 'Health' },
];

function formatScore(value?: number) {
  if (value == null || !Number.isFinite(value)) return null;
  return value.toFixed(1);
}

function readRating(
  ratings: LocalityRatings | null | undefined,
  keys: readonly (keyof LocalityRatings)[],
) {
  if (!ratings) return undefined;
  for (const key of keys) {
    const raw = ratings[key];
    const value = typeof raw === 'number' ? raw : Number(raw);
    if (Number.isFinite(value)) return value;
  }
  return undefined;
}

export function LocalityRatingsGrid({ ratings }: { ratings?: LocalityRatings | null }) {
  const items = RATING_ITEMS.map((item) => ({
    ...item,
    score: formatScore(readRating(ratings, item.keys)),
  })).filter((item) => item.score);

  if (items.length === 0) return null;

  return (
    <View style={styles.grid}>
      <LinearGradient
        colors={[palette.white, LOCALITY_RATINGS_GRADIENT_SOFT_BLUE]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={[palette.vibeMatchCardGradientStart, palette.vibeMatchCardGradientEnd]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
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
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: LOCALITY_RATINGS_RADIUS,
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
