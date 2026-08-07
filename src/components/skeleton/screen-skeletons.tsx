import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';

import { EventCardSkeleton } from '@/components/skeleton/card-skeletons';
import { PropertyCardSkeleton } from '@/components/skeleton/property-card-skeleton';
import { Skeleton } from '@/components/ui/skeleton';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';

export function HdpScreenSkeleton() {
  return (
    <ScrollView style={styles.flex} showsVerticalScrollIndicator={false}>
      <Skeleton height={320} borderRadius={0} />
      <View style={styles.hdpSheet}>
        <Skeleton width="70%" height={24} />
        <Skeleton width="40%" height={18} />
        <Skeleton height={72} borderRadius={Radius.md} />
        <Skeleton height={56} borderRadius={Radius.md} />
        <View style={styles.navRow}>
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} width={72} height={28} borderRadius={Radius.full} />
          ))}
        </View>
        <Skeleton width="35%" height={18} />
        <Skeleton height={80} />
        <Skeleton width="45%" height={18} />
        <View style={styles.chipRow}>
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} width={88} height={36} borderRadius={Radius.full} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

export function HomePropertiesSkeleton() {
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(width - 48, 340);

  return (
    <View style={styles.homeProperties}>
      <PropertyCardSkeleton style={{ width: cardWidth, alignSelf: 'center' }} />
    </View>
  );
}

export function HomeFeedSkeleton() {
  return (
    <View style={styles.feedRow}>
      {Array.from({ length: 3 }, (_, i) => (
        <View key={i} style={styles.feedCard}>
          <Skeleton height={268} borderRadius={Radius.md} />
        </View>
      ))}
    </View>
  );
}

export function SrpListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View style={styles.srpList}>
      {Array.from({ length: count }, (_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </View>
  );
}

export function WishlistListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View style={styles.wishlistList}>
      {Array.from({ length: count }, (_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </View>
  );
}

export function DashboardEventsSkeleton() {
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(width - 72, 300);

  return (
    <View style={[styles.dashboardEvents, { width: cardWidth }]}>
      <EventCardSkeleton imageHeight={168} />
    </View>
  );
}

export function ReferralScreenSkeleton() {
  return (
    <View style={styles.referral}>
      <Skeleton height={180} borderRadius={Radius.md} />
      <Skeleton width="50%" height={20} />
      <Skeleton height={56} borderRadius={Radius.md} />
      <Skeleton width="80%" height={14} />
      <Skeleton width="70%" height={14} />
      <Skeleton height={48} borderRadius={Radius.full} />
    </View>
  );
}

export function MoveInPaymentSkeleton() {
  return (
    <View style={styles.payment}>
      <Skeleton width="45%" height={18} />
      <View style={styles.paymentBox}>
        {Array.from({ length: 5 }, (_, i) => (
          <View key={i} style={styles.rowBetween}>
            <Skeleton width="50%" height={14} />
            <Skeleton width="22%" height={14} />
          </View>
        ))}
        <View style={styles.divider} />
        <View style={styles.rowBetween}>
          <Skeleton width="30%" height={18} />
          <Skeleton width="28%" height={18} />
        </View>
      </View>
      <Skeleton height={52} borderRadius={Radius.full} />
    </View>
  );
}

export function ChecklistSkeleton() {
  return (
    <View style={styles.checklist}>
      <Skeleton width="60%" height={20} />
      <Skeleton width="90%" height={14} />
      {Array.from({ length: 6 }, (_, i) => (
        <View key={i} style={styles.checkRow}>
          <Skeleton width={22} height={22} borderRadius={6} />
          <View style={styles.flex}>
            <Skeleton width="75%" height={16} />
          </View>
        </View>
      ))}
      <Skeleton height={100} borderRadius={Radius.md} />
      <Skeleton height={52} borderRadius={Radius.full} />
    </View>
  );
}

export function VibeGridSkeleton() {
  return (
    <View style={styles.vibeGrid}>
      {Array.from({ length: 9 }, (_, i) => (
        <Skeleton key={i} height={44} borderRadius={Radius.full} style={styles.vibeChip} />
      ))}
    </View>
  );
}

export function EventDetailSkeleton() {
  return (
    <ScrollView style={styles.flex} showsVerticalScrollIndicator={false}>
      <Skeleton height={240} borderRadius={0} />
      <View style={styles.eventDetail}>
        <Skeleton width="75%" height={24} />
        <Skeleton width="40%" height={14} />
        <Skeleton width="55%" height={14} />
        <Skeleton height={90} />
        <Skeleton width="35%" height={16} />
        <View style={styles.attendeeRow}>
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} width={40} height={40} borderRadius={Radius.full} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

export function CreateTicketSkeleton() {
  return (
    <View style={styles.createTicket}>
      <Skeleton width="40%" height={18} />
      {Array.from({ length: 3 }, (_, i) => (
        <Skeleton key={i} height={56} borderRadius={Radius.md} />
      ))}
      <Skeleton width="30%" height={14} />
      <Skeleton height={120} borderRadius={Radius.md} />
      <Skeleton height={52} borderRadius={Radius.full} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  hdpSheet: {
    marginTop: -28,
    backgroundColor: palette.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 16,
  },
  navRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  homeProperties: {
    minHeight: 420,
    justifyContent: 'center',
  },
  feedRow: {
    flexDirection: 'row',
    gap: 12,
    paddingLeft: 4,
  },
  feedCard: {
    width: 172,
  },
  srpList: {
    gap: 20,
    paddingTop: 8,
  },
  wishlistList: {
    gap: 20,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  dashboardEvents: {
    gap: 8,
  },
  referral: {
    padding: 20,
    gap: 16,
  },
  payment: {
    padding: 20,
    gap: 16,
  },
  paymentBox: {
    backgroundColor: palette.white,
    borderRadius: Radius.md,
    padding: 16,
    gap: 14,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: palette.gray[200],
    marginVertical: 4,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checklist: {
    padding: 20,
    gap: 14,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  vibeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingVertical: 8,
  },
  vibeChip: {
    width: '30%',
    flexGrow: 1,
  },
  eventDetail: {
    padding: 20,
    gap: 14,
  },
  attendeeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  createTicket: {
    padding: 20,
    gap: 14,
  },
});
