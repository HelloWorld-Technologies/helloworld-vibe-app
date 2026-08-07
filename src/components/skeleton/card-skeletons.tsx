import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Skeleton } from '@/components/ui/skeleton';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';

type CountProps = {
  count?: number;
  style?: StyleProp<ViewStyle>;
};

export function TicketCardSkeleton() {
  return (
    <View style={styles.ticketCard}>
      <View style={styles.rowBetween}>
        <Skeleton width="58%" height={16} />
        <Skeleton width={72} height={22} borderRadius={Radius.full} />
      </View>
      <View style={styles.rowBetween}>
        <Skeleton width="36%" height={12} />
        <Skeleton width="40%" height={12} />
      </View>
      <Skeleton width={96} height={14} />
    </View>
  );
}

export function TicketListSkeleton({ count = 4, style }: CountProps) {
  return (
    <View style={[styles.list, style]}>
      {Array.from({ length: count }, (_, i) => (
        <TicketCardSkeleton key={i} />
      ))}
    </View>
  );
}

export function PaymentCardSkeleton() {
  return (
    <View style={styles.paymentCard}>
      <View style={styles.rowBetween}>
        <Skeleton width="55%" height={16} />
        <Skeleton width={64} height={22} borderRadius={Radius.full} />
      </View>
      <Skeleton width="42%" height={12} />
      <View style={styles.rowBetween}>
        <Skeleton width={88} height={20} />
        <Skeleton width={72} height={32} borderRadius={Radius.full} />
      </View>
    </View>
  );
}

export function PaymentListSkeleton({ count = 4, style }: CountProps) {
  return (
    <View style={[styles.list, style]}>
      {Array.from({ length: count }, (_, i) => (
        <PaymentCardSkeleton key={i} />
      ))}
    </View>
  );
}

export function VisitCardSkeleton() {
  return (
    <View style={styles.visitCard}>
      <Skeleton height={160} borderRadius={Radius.md} />
      <View style={styles.visitBody}>
        <View style={styles.rowBetween}>
          <Skeleton width="60%" height={18} />
          <Skeleton width={70} height={22} borderRadius={Radius.full} />
        </View>
        <Skeleton width="45%" height={14} />
        <Skeleton width="70%" height={14} />
        <View style={styles.actions}>
          <Skeleton height={40} borderRadius={Radius.full} style={styles.flex} />
          <Skeleton height={40} borderRadius={Radius.full} style={styles.flex} />
        </View>
      </View>
    </View>
  );
}

export function VisitListSkeleton({ count = 3, style }: CountProps) {
  return (
    <View style={[styles.list, style]}>
      {Array.from({ length: count }, (_, i) => (
        <VisitCardSkeleton key={i} />
      ))}
    </View>
  );
}

export function MateCardSkeleton() {
  return (
    <View style={styles.mateCard}>
      <Skeleton width={48} height={48} borderRadius={Radius.full} />
      <View style={styles.mateCopy}>
        <Skeleton width="55%" height={16} />
        <Skeleton width="40%" height={12} />
        <Skeleton width="70%" height={12} />
      </View>
    </View>
  );
}

export function MateListSkeleton({ count = 4, style }: CountProps) {
  return (
    <View style={[styles.paddedList, style]}>
      {Array.from({ length: count }, (_, i) => (
        <MateCardSkeleton key={i} />
      ))}
    </View>
  );
}

export function EventCardSkeleton({ imageHeight = 140 }: { imageHeight?: number }) {
  return (
    <View style={styles.eventCard}>
      <Skeleton height={imageHeight} borderRadius={Radius.md} />
      <Skeleton width="80%" height={16} />
      <Skeleton width="45%" height={12} />
      <Skeleton width="60%" height={12} />
    </View>
  );
}

export function EventGridSkeleton({ count = 4, style }: CountProps) {
  return (
    <View style={[styles.eventGrid, style]}>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={styles.eventGridItem}>
          <EventCardSkeleton />
        </View>
      ))}
    </View>
  );
}

export function CategoryRowSkeleton() {
  return (
    <View style={styles.categoryRow}>
      <Skeleton width={40} height={40} borderRadius={Radius.md} />
      <View style={styles.flex}>
        <Skeleton width="55%" height={16} />
        <Skeleton width="80%" height={12} style={styles.mt6} />
      </View>
      <Skeleton width={16} height={16} borderRadius={4} />
    </View>
  );
}

export function CategoryListSkeleton({ count = 6, style }: CountProps) {
  return (
    <View style={[styles.list, style]}>
      {Array.from({ length: count }, (_, i) => (
        <CategoryRowSkeleton key={i} />
      ))}
    </View>
  );
}

export function FormSkeleton({ fields = 4, style }: { fields?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.form, style]}>
      {Array.from({ length: fields }, (_, i) => (
        <View key={i} style={styles.field}>
          <Skeleton width="30%" height={12} />
          <Skeleton height={48} borderRadius={Radius.md} />
        </View>
      ))}
      <Skeleton height={52} borderRadius={Radius.full} style={styles.mt8} />
    </View>
  );
}

export function StepsListSkeleton({ count = 4, style }: CountProps) {
  return (
    <View style={[styles.list, style]}>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={styles.stepRow}>
          <Skeleton width={28} height={28} borderRadius={Radius.full} />
          <View style={styles.flex}>
            <Skeleton width="65%" height={16} />
            <Skeleton width="90%" height={12} style={styles.mt6} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function ChatThreadSkeleton({ count = 5, style }: CountProps) {
  return (
    <View style={[styles.chat, style]}>
      {Array.from({ length: count }, (_, i) => (
        <View
          key={i}
          style={[styles.bubble, i % 2 === 0 ? styles.bubbleLeft : styles.bubbleRight]}>
          <Skeleton width={i % 2 === 0 ? '78%' : '62%'} height={56} borderRadius={Radius.md} />
        </View>
      ))}
    </View>
  );
}

export function InvoiceDetailSkeleton({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.invoice, style]}>
      <Skeleton width="50%" height={20} />
      <Skeleton width="35%" height={14} />
      <View style={styles.invoiceBox}>
        {Array.from({ length: 5 }, (_, i) => (
          <View key={i} style={styles.rowBetween}>
            <Skeleton width="40%" height={14} />
            <Skeleton width="25%" height={14} />
          </View>
        ))}
      </View>
      <Skeleton height={52} borderRadius={Radius.full} />
    </View>
  );
}

export function SmartMeterRoomSkeleton({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.list, style]}>
      {Array.from({ length: 3 }, (_, i) => (
        <View key={i} style={styles.meterCard}>
          <Skeleton width="45%" height={16} />
          <Skeleton width="30%" height={28} />
          <Skeleton width="60%" height={12} />
        </View>
      ))}
    </View>
  );
}

export function LocalityResultSkeleton({ count = 6, style }: CountProps) {
  return (
    <View style={[styles.list, style]}>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={styles.localityRow}>
          <Skeleton width={20} height={20} borderRadius={4} />
          <View style={styles.flex}>
            <Skeleton width="55%" height={14} />
            <Skeleton width="35%" height={12} style={styles.mt6} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
  paddedList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  ticketCard: {
    backgroundColor: palette.white,
    borderRadius: Radius.sm,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  paymentCard: {
    backgroundColor: palette.white,
    borderRadius: Radius.md,
    padding: 16,
    gap: 12,
  },
  visitCard: {
    gap: 12,
  },
  visitBody: {
    gap: 8,
  },
  mateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: palette.white,
    borderRadius: Radius.md,
    padding: 16,
  },
  mateCopy: {
    flex: 1,
    gap: 6,
  },
  eventCard: {
    gap: 8,
  },
  eventGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 20,
  },
  eventGridItem: {
    width: '47%',
    flexGrow: 1,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: palette.white,
    borderRadius: Radius.md,
    padding: 14,
  },
  form: {
    gap: 16,
    paddingHorizontal: 20,
  },
  field: {
    gap: 8,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 8,
  },
  chat: {
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  bubble: {
    width: '100%',
  },
  bubbleLeft: {
    alignItems: 'flex-start',
  },
  bubbleRight: {
    alignItems: 'flex-end',
  },
  invoice: {
    gap: 16,
    padding: 20,
  },
  invoiceBox: {
    backgroundColor: palette.white,
    borderRadius: Radius.md,
    padding: 16,
    gap: 14,
  },
  meterCard: {
    backgroundColor: palette.white,
    borderRadius: Radius.md,
    padding: 16,
    gap: 10,
  },
  localityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  flex: {
    flex: 1,
  },
  mt6: {
    marginTop: 6,
  },
  mt8: {
    marginTop: 8,
  },
});
