import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EventCardSkeleton } from '@/components/skeleton/card-skeletons';
import { PropertyCardSkeleton } from '@/components/skeleton/property-card-skeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { HDP_HERO_TOTAL_HEIGHT } from '@/components/hdp/hdp-hero-media';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';

const HDP_SHEET_OVERLAP = 48;
const SRP_HERO_HEIGHT = 398;
const SRP_SHEET_OVERLAP = 45;

export function HdpScreenSkeleton() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.flex}>
      <ScrollView style={styles.flex} showsVerticalScrollIndicator={false}>
        <View style={styles.hdpHero}>
          <Skeleton height={HDP_HERO_TOTAL_HEIGHT} borderRadius={0} />
          <View style={styles.hdpHeroTabs}>
            <Skeleton width={110} height={32} borderRadius={Radius.full} />
            <Skeleton width={84} height={32} borderRadius={Radius.full} />
            <Skeleton width={72} height={32} borderRadius={Radius.full} />
          </View>
        </View>

        <View style={styles.hdpSheet}>
          <View style={styles.hdpTitleRow}>
            <Skeleton width="68%" height={28} />
            <Skeleton width={28} height={28} borderRadius={Radius.full} />
          </View>
          <Skeleton width="42%" height={14} />

          <View style={styles.hdpPricingRow}>
            <View style={styles.hdpPricingCol}>
              <Skeleton width="70%" height={12} />
              <Skeleton width="55%" height={24} />
            </View>
            <View style={styles.hdpPricingDivider} />
            <View style={styles.hdpPricingCol}>
              <Skeleton width="65%" height={12} />
              <Skeleton width="60%" height={24} />
            </View>
          </View>

          <View style={styles.hdpRatingCard}>
            <Skeleton width={88} height={24} borderRadius={Radius.full} />
            <Skeleton width="90%" height={20} />
            <Skeleton width="70%" height={16} />
            <View style={styles.hdpStatsRow}>
              {Array.from({ length: 3 }, (_, i) => (
                <View key={i} style={styles.hdpStatCol}>
                  <Skeleton width={40} height={22} />
                  <Skeleton width={56} height={12} />
                </View>
              ))}
            </View>
          </View>

          <Skeleton height={72} borderRadius={Radius.md} />

          <View style={styles.navRow}>
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} width={84} height={36} borderRadius={Radius.full} />
            ))}
          </View>

          <View style={styles.hdpBodySection}>
            <Skeleton width="40%" height={20} />
            <Skeleton width="100%" height={14} />
            <Skeleton width="92%" height={14} />
            <Skeleton width="78%" height={14} />
          </View>

          <View style={styles.hdpBodySection}>
            <Skeleton width="48%" height={20} />
            <View style={styles.chipRow}>
              {Array.from({ length: 6 }, (_, i) => (
                <Skeleton key={i} width={96} height={32} borderRadius={Radius.full} />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.hdpFooter, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Skeleton height={48} borderRadius={Radius.sm} style={styles.hdpFooterButton} />
        <Skeleton height={48} borderRadius={Radius.sm} style={styles.hdpFooterButton} />
      </View>
    </View>
  );
}

export function HomePropertiesSkeleton() {
  const { width, height } = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const contentWidth = width - 48;
  const gap = 12;
  const cardWidth = isTablet ? (contentWidth - gap) / 2 : Math.min(contentWidth, 340);

  return (
    <View style={[styles.homeProperties, isTablet ? styles.homePropertiesTablet : null]}>
      <PropertyCardSkeleton style={{ width: cardWidth, alignSelf: 'center' }} />
      {isTablet ? (
        <PropertyCardSkeleton style={{ width: cardWidth, alignSelf: 'center' }} />
      ) : null}
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

export function SrpScreenSkeleton() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.flex}>
      <ScrollView style={styles.flex} showsVerticalScrollIndicator={false}>
        <View style={styles.srpHero}>
          <Skeleton height={SRP_HERO_HEIGHT} borderRadius={0} />
        </View>

        <View style={styles.srpSheet}>
          <View style={styles.srpSheetSection}>
            <Skeleton width="72%" height={28} />
            <Skeleton width="58%" height={16} />

            <View style={styles.srpRatingsCard}>
              <View style={styles.srpRatingsRow}>
                {Array.from({ length: 4 }, (_, i) => (
                  <View key={i} style={styles.srpRatingItem}>
                    <Skeleton width={40} height={40} borderRadius={Radius.full} />
                    <Skeleton width={48} height={12} />
                  </View>
                ))}
              </View>
            </View>
          </View>

          <Skeleton height={44} borderRadius={Radius.full} />

          <View style={styles.srpTabContent}>
            <Skeleton width="88%" height={24} />
            <VibeGridSkeleton />
            <SrpListSkeleton />
          </View>
        </View>
      </ScrollView>

      <View style={[styles.srpFooter, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Skeleton height={48} borderRadius={Radius.sm} style={styles.srpFooterFilter} />
        <Skeleton height={48} borderRadius={Radius.sm} style={styles.srpFooterSort} />
      </View>
    </View>
  );
}

export function SrpListSkeleton({ count = 3 }: { count?: number }) {
  const { width, height } = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const contentWidth = width - 48;
  const gap = 16;
  const cardWidth = isTablet ? (contentWidth - gap) / 2 : contentWidth;
  const skeletonCount = isTablet ? Math.max(count, 4) : count;

  return (
    <View style={[styles.srpList, isTablet ? styles.srpListTablet : null]}>
      {Array.from({ length: skeletonCount }, (_, i) => (
        <PropertyCardSkeleton
          key={i}
          style={isTablet ? { width: cardWidth } : undefined}
        />
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

export function BookingChargeOptionSkeleton() {
  return (
    <View style={styles.bookingChargeCard}>
      <Skeleton width={22} height={22} borderRadius={11} />
      <View style={styles.bookingChargeCopy}>
        <Skeleton width="46%" height={16} />
        <Skeleton width="88%" height={12} />
      </View>
      <Skeleton width={64} height={16} />
    </View>
  );
}

export function BookingChargesSkeleton({ count = 4 }: { count?: number }) {
  return (
    <View style={styles.bookingCharges}>
      {Array.from({ length: count }, (_, i) => (
        <BookingChargeOptionSkeleton key={i} />
      ))}
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
  hdpHero: {
    position: 'relative',
  },
  hdpHeroTabs: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: HDP_SHEET_OVERLAP + 16,
    flexDirection: 'row',
    gap: 8,
  },
  hdpSheet: {
    marginTop: -HDP_SHEET_OVERLAP,
    backgroundColor: palette.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 120,
    gap: 24,
  },
  hdpTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  hdpPricingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  hdpPricingCol: {
    flex: 1,
    gap: 8,
  },
  hdpPricingDivider: {
    width: 1,
    height: 44,
    backgroundColor: palette.gray[200],
  },
  hdpRatingCard: {
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: palette.blue[100],
    backgroundColor: palette.blue[25],
    padding: 16,
    gap: 12,
  },
  hdpStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.gray[200],
  },
  hdpStatCol: {
    flex: 1,
    gap: 6,
    alignItems: 'flex-start',
  },
  hdpBodySection: {
    gap: 12,
  },
  hdpFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 16,
    backgroundColor: palette.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.gray[200],
  },
  hdpFooterButton: {
    flex: 1,
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
  homePropertiesTablet: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  feedRow: {
    flexDirection: 'row',
    gap: 12,
    paddingLeft: 4,
  },
  feedCard: {
    width: 172,
  },
  srpHero: {
    height: SRP_HERO_HEIGHT,
    overflow: 'hidden',
  },
  srpSheet: {
    backgroundColor: palette.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -SRP_SHEET_OVERLAP,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 120,
    gap: 32,
  },
  srpSheetSection: {
    gap: 16,
  },
  srpRatingsCard: {
    borderRadius: 16,
    backgroundColor: palette.gray[50],
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  srpRatingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  srpRatingItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  srpTabContent: {
    gap: 16,
  },
  srpFooter: {
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
  },
  srpFooterFilter: {
    width: 108,
  },
  srpFooterSort: {
    flex: 1,
  },
  srpList: {
    gap: 20,
    paddingTop: 8,
  },
  srpListTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
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
  bookingCharges: {
    gap: 10,
  },
  bookingChargeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderColor: palette.gray[200],
    borderRadius: Radius.md,
    padding: 14,
    backgroundColor: palette.white,
  },
  bookingChargeCopy: {
    flex: 1,
    gap: 8,
    paddingTop: 2,
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
