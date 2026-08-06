import { LinearGradient } from 'expo-linear-gradient';
import { HwSymbol } from '@/components/ui/hw-symbol';
import { StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';

const RATINGS = [
  { id: 'transit', score: '4.8', emoji: '🚍', label: 'Transit' },
  { id: 'dining', score: '4.8', emoji: '🍽️', label: 'Dining' },
  { id: 'night-life', score: '4.8', emoji: '🌙', label: 'Night Life' },
  { id: 'health', score: '4.8', emoji: '🏥', label: 'Health' },
] as const;

export function LocalityRatingsGrid() {
  return (
    <LinearGradient
      colors={[palette.blue[50], palette.purpleScale[50]]}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={styles.grid}>
      {RATINGS.map((item) => (
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
