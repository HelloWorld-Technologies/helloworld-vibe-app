import { Image } from 'expo-image';
import { HwSymbol } from '@/components/ui/hw-symbol';
import { Pressable, StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { ImageAssets } from '@/constants/assets';
import { formatBookingAmount, formatBookingMoveInDate } from '@/utils/booking-payment';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';

type BookingPropertySummaryProps = {
  propertyName: string;
  location: string;
  roomName: string;
  occupancyLabel: string;
  rent: number;
  moveInDate: string;
  imageUri?: string;
  onEdit?: () => void;
};

export function BookingPropertySummary({
  propertyName,
  location,
  roomName,
  occupancyLabel,
  rent,
  moveInDate,
  imageUri,
  onEdit,
}: BookingPropertySummaryProps) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Image
          source={imageUri ? { uri: imageUri } : ImageAssets.loginBento1}
          style={styles.image}
          contentFit="cover"
        />
        <View style={styles.titleBlock}>
          <Typography variant="text" size="md" weight="bold">
            {propertyName}
          </Typography>
          <Typography variant="text" size="xs" color={palette.gray[600]} numberOfLines={2}>
            {location}
          </Typography>
        </View>
        {onEdit ? (
          <Pressable onPress={onEdit} style={styles.editButton} accessibilityRole="button">
            <HwSymbol name="pencil" size={12} tintColor={palette.helloLime} />
            <Typography variant="text" size="xs" weight="bold" color={palette.helloLime}>
              Edit
            </Typography>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.roomRow}>
        <View style={styles.roomCopy}>
          <Typography variant="text" size="sm" weight="bold">
            {roomName}
          </Typography>
          <Typography variant="text" size="xs" color={palette.gray[600]}>
            {occupancyLabel}
          </Typography>
        </View>
        <Typography variant="text" size="sm" weight="bold">
          {formatBookingAmount(rent)}/mo
        </Typography>
      </View>

      <View style={styles.dateRow}>
        <HwSymbol name="calendar" size={14} tintColor={palette.gray[600]} />
        <Typography variant="text" size="xs" color={palette.gray[700]}>
          Move in Date: {formatBookingMoveInDate(moveInDate)}
        </Typography>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: palette.gray[200],
    padding: 16,
    gap: 14,
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  image: {
    width: 56,
    height: 56,
    borderRadius: Radius.sm,
    backgroundColor: palette.gray[100],
  },
  titleBlock: {
    flex: 1,
    gap: 4,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  roomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  roomCopy: {
    flex: 1,
    gap: 2,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
