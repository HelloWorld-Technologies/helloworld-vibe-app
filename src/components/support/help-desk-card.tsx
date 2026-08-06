import { HwSymbol } from '@/components/ui/hw-symbol';
import { Linking, Platform, Pressable, StyleSheet, View } from 'react-native';

import { ProfileIcon } from '@/components/profile-icon';
import { Typography } from '@/components/ui/typography';
import { HELP_DESK_PHONE, HELP_DESK_PHONE_DISPLAY } from '@/constants/tenant';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';

type HelpDeskCardProps = {
  onPress?: () => void;
};

export function callHelpDesk() {
  const url =
    Platform.OS === 'android' ? `tel:${HELP_DESK_PHONE}` : `telprompt:${HELP_DESK_PHONE}`;
  void Linking.openURL(url);
}

export function HelpDeskCard({ onPress = callHelpDesk }: HelpDeskCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      accessibilityRole="button"
      accessibilityLabel={`Call help desk ${HELP_DESK_PHONE_DISPLAY}`}>
      <View style={styles.left}>
        <ProfileIcon name="support" size={20} color={palette.gray[900]} />
        <Typography variant="text" size="sm" weight="medium" style={styles.label} numberOfLines={1}>
          {`Help desk • ${HELP_DESK_PHONE_DISPLAY}`}
        </Typography>
      </View>

      <View style={styles.action}>
        <Typography variant="text" size="sm" weight="bold" color={palette.lime[700]}>
          Call now
        </Typography>
        <HwSymbol name="arrow.right" size={14} weight="semibold" tintColor={palette.lime[700]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: palette.lime[50],
    borderWidth: 1,
    borderColor: palette.lime[400],
    borderRadius: Radius.full,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  cardPressed: {
    opacity: 0.92,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    flex: 1,
    color: palette.gray[900],
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
