import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Skeleton } from '@/components/ui/skeleton';
import { Radius } from '@/constants/theme';

type PropertyCardSkeletonProps = {
  style?: StyleProp<ViewStyle>;
};

export function PropertyCardSkeleton({ style }: PropertyCardSkeletonProps) {
  return (
    <View style={[styles.card, style]}>
      <Skeleton height={220} borderRadius={Radius.md} />
      <View style={styles.body}>
        <Skeleton width="72%" height={18} />
        <Skeleton width="48%" height={14} />
        <View style={styles.meta}>
          <Skeleton width={88} height={14} />
          <Skeleton width={64} height={14} />
        </View>
        <View style={styles.actions}>
          <Skeleton height={44} borderRadius={Radius.full} style={styles.action} />
          <Skeleton height={44} borderRadius={Radius.full} style={styles.action} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
  },
  body: {
    gap: 8,
    paddingHorizontal: 4,
  },
  meta: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  action: {
    flex: 1,
  },
});
