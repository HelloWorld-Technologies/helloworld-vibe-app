import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { EmptyStateAssets } from '@/constants/assets';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';

type SrpNoResultsEmptyStateProps = {
  onClearFilters: () => void;
  onContactUs: () => void;
};

export function SrpNoResultsEmptyState({
  onClearFilters,
  onContactUs,
}: SrpNoResultsEmptyStateProps) {
  return (
    <View style={styles.root}>
      <Image
        source={EmptyStateAssets.default}
        style={styles.image}
        contentFit="contain"
        accessibilityIgnoresInvertColors
        accessibilityLabel="No results illustration"
      />

      <View style={styles.copy}>
        <Typography variant="text" size="lg" weight="bold" style={styles.title}>
          No results found.
        </Typography>
        <Typography variant="text" size="sm" color={palette.gray[900]} style={styles.subtitle}>
          We couldn&apos;t find anything matching your search. Try adjusting your filters, or reach
          out to us- we&apos;ll help you find the right place.
        </Typography>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={onClearFilters}
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryPressed]}
          accessibilityRole="button"
          accessibilityLabel="Clear Filters">
          <Typography variant="text" size="sm" weight="bold" color={palette.lime[800]}>
            Clear Filters
          </Typography>
        </Pressable>

        <Pressable
          onPress={onContactUs}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryPressed]}
          accessibilityRole="button"
          accessibilityLabel="Contact Us">
          <Typography variant="text" size="sm" weight="bold" color={palette.lime[800]}>
            Contact Us
          </Typography>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 16,
  },
  image: {
    width: 163,
    height: 230,
  },
  copy: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginTop: 8,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: Radius.full,
    backgroundColor: palette.lime[50],
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  secondaryPressed: {
    backgroundColor: palette.lime[100],
  },
  primaryButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: Radius.full,
    backgroundColor: palette.lime[300],
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  primaryPressed: {
    backgroundColor: palette.lime[400],
  },
});
