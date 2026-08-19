import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { DASHBOARD_CANCELLED_CARD_GRADIENT } from '@/constants/dashboard';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import { COMING_SOON_IMAGE_URI } from '@/utils/images';

type DashboardBookingCancelledCardProps = {
  propertyName: string;
  locality?: string;
  imageUrl?: string;
  onExplorePress: () => void;
  onSupportPress: () => void;
};

export function DashboardBookingCancelledCard({
  propertyName,
  locality,
  imageUrl,
  onExplorePress,
  onSupportPress,
}: DashboardBookingCancelledCardProps) {
  return (
    <LinearGradient
      colors={[...DASHBOARD_CANCELLED_CARD_GRADIENT.colors]}
      start={DASHBOARD_CANCELLED_CARD_GRADIENT.start}
      end={DASHBOARD_CANCELLED_CARD_GRADIENT.end}
      style={styles.card}>
      <View style={styles.propertyRow}>
        <Image
          source={{ uri: imageUrl || COMING_SOON_IMAGE_URI }}
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
            <Typography variant="label" size="xs" weight="medium" color={palette.red[800]}>
              Booking Cancelled
            </Typography>
          </View>
        </View>
      </View>

      <View style={styles.messageBlock}>
        <Typography variant="text" size="lg" weight="bold">
          This booking is no longer active
        </Typography>
        <Typography variant="text" size="sm" color={palette.gray[600]}>
          You can explore other homes or contact support if you need help with this cancellation.
        </Typography>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={styles.primaryButton}
          onPress={onExplorePress}
          accessibilityRole="button">
          <Typography variant="text" size="sm" weight="bold" color={palette.gray[800]}>
            Explore Homes
          </Typography>
        </Pressable>
        <Pressable
          style={styles.secondaryButton}
          onPress={onSupportPress}
          accessibilityRole="button">
          <Typography variant="text" size="sm" weight="bold" color={palette.gray[800]}>
            Contact Support
          </Typography>
        </Pressable>
      </View>
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
    backgroundColor: palette.red[100],
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  messageBlock: {
    gap: 6,
  },
  actions: {
    gap: 8,
  },
  primaryButton: {
    minHeight: 44,
    borderRadius: Radius.sm,
    backgroundColor: palette.lime[400],
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    minHeight: 44,
    borderRadius: Radius.sm,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
});
