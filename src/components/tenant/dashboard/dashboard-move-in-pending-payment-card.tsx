import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { DASHBOARD_RENT_CARD_GRADIENT } from '@/constants/dashboard';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import { COMING_SOON_IMAGE_URI } from '@/utils/images';
import { priceFormatter } from '@/utils/tenant-format';

const PROPERTY_FALLBACK_IMAGE = COMING_SOON_IMAGE_URI;

type DashboardMoveInPendingPaymentCardProps = {
  propertyName: string;
  locality?: string;
  imageUrl?: string;
  amount: number;
  onPayPress: () => void;
};

export function DashboardMoveInPendingPaymentCard({
  propertyName,
  locality,
  imageUrl,
  amount,
  onPayPress,
}: DashboardMoveInPendingPaymentCardProps) {
  return (
    <LinearGradient
      colors={[...DASHBOARD_RENT_CARD_GRADIENT.colors]}
      start={DASHBOARD_RENT_CARD_GRADIENT.start}
      end={DASHBOARD_RENT_CARD_GRADIENT.end}
      style={styles.card}>
      <View style={styles.propertyRow}>
        <Image
          source={{ uri: imageUrl || PROPERTY_FALLBACK_IMAGE }}
          style={styles.thumbnail}
          contentFit="cover"
        />
        <View style={styles.propertyCopy}>
          <Typography variant="text" size="sm" weight="bold" numberOfLines={1}>
            {propertyName}
          </Typography>
          {locality ? (
            <Typography variant="text" size="xs" color={palette.gray[600]} numberOfLines={2}>
              {locality}
            </Typography>
          ) : null}
          <View style={styles.badge}>
            <Typography variant="label" size="xs" weight="medium" color="#7A271A">
              Partial Payment (Token Paid)
            </Typography>
          </View>
        </View>
      </View>

      <View style={styles.messageBlock}>
        <Typography variant="text" size="lg" weight="bold">
          You&apos;re Almost There!
        </Typography>
        <Typography variant="text" size="sm" color={palette.gray[600]}>
          Complete your remaining payment and get ready to move in.
        </Typography>
        <Typography variant="display" size="sm" weight="bold" color={palette.red[700]} style={styles.amount}>
          {priceFormatter(amount)}
        </Typography>
      </View>

      <Pressable style={styles.payButton} onPress={onPayPress} accessibilityRole="button">
        <Typography variant="text" size="sm" weight="bold" color={palette.gray[800]}>
          Pay Now
        </Typography>
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.md,
    padding: 16,
    gap: 16,
    shadowColor: '#0A0D12',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  propertyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: Radius.sm,
    backgroundColor: palette.gray[100],
  },
  propertyCopy: {
    flex: 1,
    gap: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 4,
    backgroundColor: '#FFF0D1',
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  messageBlock: {
    gap: 6,
  },
  amount: {
    marginTop: 4,
  },
  payButton: {
    minHeight: 44,
    borderRadius: Radius.sm,
    backgroundColor: palette.lime[400],
    alignItems: 'center',
    justifyContent: 'center',
  },
});
