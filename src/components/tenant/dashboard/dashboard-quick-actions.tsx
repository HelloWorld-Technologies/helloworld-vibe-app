import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';

import { DashboardIcon, type DashboardIconName } from '@/components/dashboard/dashboard-icon';
import { Typography } from '@/components/ui/typography';
import { DASHBOARD_SOS_GRADIENT } from '@/constants/dashboard';
import palette from '@/constants/palette';
import { TENANT_QUICK_ACTIONS } from '@/constants/tenant';
import { Radius } from '@/constants/theme';

type DashboardQuickActionsProps = {
  onActionPress: (id: string) => void;
};

function QuickActionTile({
  label,
  icon,
  variant,
  onPress,
}: {
  label: string;
  icon: DashboardIconName;
  variant: 'sos' | 'default';
  onPress: () => void;
}) {
  const content = (
    <>
      <DashboardIcon name={icon} size={36} color={variant === 'sos' ? palette.red[600] : palette.blue[800]} />
      <Typography variant="label" size="xs" style={styles.label}>
        {label}
      </Typography>
    </>
  );

  if (variant === 'sos') {
    return (
      <Pressable style={styles.item} onPress={onPress} accessibilityRole="button">
        <LinearGradient
          colors={[...DASHBOARD_SOS_GRADIENT.colors]}
          start={DASHBOARD_SOS_GRADIENT.start}
          end={DASHBOARD_SOS_GRADIENT.end}
          style={styles.tile}>
          {content}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable style={styles.item} onPress={onPress} accessibilityRole="button">
      <View style={[styles.tile, styles.tileDefault]}>{content}</View>
    </Pressable>
  );
}

export function DashboardQuickActions({ onActionPress }: DashboardQuickActionsProps) {
  return (
    <View style={styles.row}>
      {TENANT_QUICK_ACTIONS.map((action) => (
        <QuickActionTile
          key={action.id}
          label={action.label}
          icon={action.icon}
          variant={action.id === 'sos' ? 'sos' : 'default'}
          onPress={() => onActionPress(action.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  item: {
    width: 80,
    alignItems: 'center',
  },
  tile: {
    width: 80,
    height: 80,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  tileDefault: {
    backgroundColor: palette.blue[50],
  },
  label: {
    textAlign: 'center',
    color: palette.gray[700],
  },
});
