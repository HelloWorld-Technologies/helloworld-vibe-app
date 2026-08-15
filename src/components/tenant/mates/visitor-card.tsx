import { StyleSheet, View } from 'react-native';
import { MateCardDetails } from '@/components/tenant/mates/mate-card-details';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import type { RoomMate } from '@/types/roommate';

type VisitorCardProps = {
  mate: RoomMate;
};

export function VisitorCard({ mate }: VisitorCardProps) {
  const isVerified = mate.kyc_done === true;

  return (
    <View style={styles.card}>
      <MateCardDetails mate={mate} />
      <View style={[styles.badge, isVerified ? styles.badgeVerified : styles.badgePending]}>
        <Typography
          variant="label"
          size="xs"
          weight="medium"
          color={isVerified ? palette.lime[800] : '#B54708'}>
          {isVerified ? 'Verified' : 'Not Verified'}
        </Typography>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.white,
    borderRadius: Radius.md,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  badge: {
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeVerified: {
    backgroundColor: palette.lime[50],
  },
  badgePending: {
    backgroundColor: '#FFFAEB',
  },
});
