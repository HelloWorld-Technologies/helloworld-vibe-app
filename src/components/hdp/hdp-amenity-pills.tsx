import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import { formatAmenityLabel, normalizeAmenityKey } from '@/utils/amenity-format';

const PREVIEW_COUNT = 11;

type HdpAmenityPillsProps = {
  items: string[];
  onViewAll?: () => void;
};

export function HdpAmenityPills({ items, onViewAll }: HdpAmenityPillsProps) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = items.length > PREVIEW_COUNT;
  const visible = expanded || !hasMore ? items : items.slice(0, PREVIEW_COUNT);

  function handleViewAll() {
    if (onViewAll) {
      onViewAll();
      return;
    }
    setExpanded((current) => !current);
  }

  return (
    <View style={styles.wrap}>
      {visible.map((item, index) => (
        <View key={`${normalizeAmenityKey(item)}-${index}`} style={styles.pill}>
          <Typography variant="text" size="sm" weight="medium" color={palette.gray[800]}>
            {formatAmenityLabel(item)}
          </Typography>
        </View>
      ))}
      {hasMore ? (
        <Pressable onPress={handleViewAll} style={[styles.pill, styles.viewAll]}>
          <Typography variant="text" size="sm" weight="medium" color={palette.lime[800]}>
            {expanded ? 'Show Less' : 'View All'}
          </Typography>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  pill: {
    backgroundColor: palette.gray[100],
    borderWidth: 1,
    borderColor: palette.gray[200],
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  viewAll: {
    backgroundColor: palette.lime[50],
    borderColor: palette.lime[300],
  },
});
