import { Pressable, StyleSheet, View } from 'react-native';
import { HwSymbol } from '@/components/ui/hw-symbol';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import type { RoomMate } from '@/types/roommate';
import { getMatePropertyLabel } from '@/utils/roommate-format';

type VisitorCardProps = {
  mate: RoomMate;
  propertyFallback?: string;
  onVerify?: () => void;
  verifying?: boolean;
};

export function VisitorCard({ mate, propertyFallback, onVerify, verifying }: VisitorCardProps) {
  const propertyLabel = getMatePropertyLabel(mate, propertyFallback);
  const isVerified = mate.kyc_done === true;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.copy}>
          <Typography variant="text" size="md" weight="bold">
            {mate.name}
          </Typography>
          {propertyLabel ? (
            <Typography variant="text" size="sm" color={palette.gray[600]}>
              {propertyLabel}
            </Typography>
          ) : null}
        </View>

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

      {!isVerified && onVerify ? (
        <Pressable
          style={styles.verifyButton}
          onPress={onVerify}
          disabled={verifying}
          accessibilityRole="button">
          <Typography variant="text" size="sm" weight="medium" color={palette.lime[700]}>
            {verifying ? 'Sending...' : 'Verify'}
          </Typography>
          <HwSymbol name="chevron.right" size={12} tintColor={palette.lime[700]} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.white,
    borderRadius: Radius.md,
    padding: 16,
    gap: 12,
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  copy: {
    flex: 1,
    gap: 4,
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
  verifyButton: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
});
