import { Pressable, StyleSheet, View } from 'react-native';

import { DashboardIcon } from '@/components/dashboard/dashboard-icon';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import type { RoomMate } from '@/types/roommate';
import { openPhoneCall } from '@/utils/contact-links';

type RoommateCardProps = {
  mate: RoomMate;
};

export function RoommateCard({ mate }: RoommateCardProps) {
  const email = mate.email?.trim();

  return (
    <View style={styles.card}>
      <View style={styles.copy}>
        <Typography variant="text" size="md" weight="bold">
          {mate.name}
        </Typography>
        {email ? (
          <Typography variant="text" size="sm" color={palette.gray[600]}>
            {email}
          </Typography>
        ) : null}
      </View>

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
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  copy: {
    flex: 1,
    gap: 4,
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
