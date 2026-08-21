import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';

import { DashboardIcon, type DashboardIconName } from '@/components/dashboard/dashboard-icon';
import { Typography } from '@/components/ui/typography';
import { DASHBOARD_SOS_GRADIENT } from '@/constants/dashboard';
import palette from '@/constants/palette';
import { TENANT_QUICK_ACTIONS } from '@/constants/tenant';
import { Radius } from '@/constants/theme';
import { useIsTablet } from '@/hooks/use-is-tablet';

type DashboardQuickActionsProps = {
  onActionPress: (id: string) => void;
};

function QuickActionTile({
  label,
  icon,
  variant,
  onPress,
  isTablet,
}: {
  label: string;
  icon: DashboardIconName;
  variant: 'sos' | 'default';
  onPress: () => void;
  isTablet: boolean;
}) {
  const content = (
    <>
      <DashboardIcon
        name={icon}
        size={isTablet ? 40 : 32}
        color={variant === 'sos' ? palette.red[600] : palette.blue[800]}
      />
      <Typography
        variant="label"
        size="xs"
        numberOfLines={2}
        style={styles.label}>
        {label}
      </Typography>
    </>
  );

  if (variant === 'sos') {
    return (
      <Pressable
        style={[styles.item, isTablet ? styles.itemTablet : null]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}>
        <LinearGradient
          colors={[...DASHBOARD_SOS_GRADIENT.colors]}
          start={DASHBOARD_SOS_GRADIENT.start}
          end={DASHBOARD_SOS_GRADIENT.end}
          style={[styles.tile, isTablet ? styles.tileTablet : null]}>
          {content}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      style={[styles.item, isTablet ? styles.itemTablet : null]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}>
      <View style={[styles.tile, styles.tileDefault, isTablet ? styles.tileTablet : null]}>
        {content}
      </View>
    </Pressable>
  );
}

export function DashboardQuickActions({ onActionPress }: DashboardQuickActionsProps) {
  const isTablet = useIsTablet();

  return (
    <View style={[styles.row, isTablet ? styles.rowTablet : null]}>
      {TENANT_QUICK_ACTIONS.map((action) => (
        <QuickActionTile
          key={action.id}
          label={action.label}
          icon={action.icon}
          variant={action.id === 'sos' ? 'sos' : 'default'}
          onPress={() => onActionPress(action.id)}
          isTablet={isTablet}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 8,
  },
  rowTablet: {
    gap: 16,
  },
  item: {
    flex: 1,
    minWidth: 0,
    alignItems: 'stretch',
  },
  itemTablet: {
    flex: 1,
  },
  tile: {
    width: '100%',
    minHeight: 80,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  tileTablet: {
    minHeight: 96,
    gap: 8,
  },
  tileDefault: {
    backgroundColor: palette.blue[50],
  },
  label: {
    textAlign: 'center',
    color: palette.gray[700],
    width: '100%',
  },
});
