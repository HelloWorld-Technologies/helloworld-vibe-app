import { Pressable, StyleSheet, View } from 'react-native';

import { DashboardIcon } from '@/components/dashboard/dashboard-icon';
import { MateCardDetails } from '@/components/tenant/mates/mate-card-details';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import type { RoomMate } from '@/types/roommate';
import { openPhoneCall } from '@/utils/contact-links';

type RoommateCardProps = {
  mate: RoomMate;
};

export function RoommateCard({ mate }: RoommateCardProps) {
  return (
    <View style={styles.card}>
      <MateCardDetails mate={mate} />
      <Pressable
        style={styles.actionButton}
        onPress={() => openPhoneCall(mate.mobile)}
        accessibilityRole="button"
        accessibilityLabel={`Call ${mate.name}`}>
        <DashboardIcon name="call" size={18} color={palette.gray[800]} />
      </Pressable>
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
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: palette.lime[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
});
