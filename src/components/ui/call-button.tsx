import { Pressable, StyleSheet, type PressableProps } from 'react-native';

import { DashboardIcon } from '@/components/dashboard/dashboard-icon';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';

type CallButtonProps = {
  onPress: PressableProps['onPress'];
  accessibilityLabel?: string;
};

export function CallButton({ onPress, accessibilityLabel = 'Call' }: CallButtonProps) {
  return (
    <Pressable
      style={styles.callButton}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}>
      <DashboardIcon name="call" size={36} color={palette.white} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  callButton: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    backgroundColor: palette.blue[900],
    alignItems: 'center',
    justifyContent: 'center',
  },
});
