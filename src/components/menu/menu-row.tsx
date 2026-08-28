import { Pressable, StyleSheet, View } from 'react-native';
import { HwSymbol } from '@/components/ui/hw-symbol';
import { ProfileIcon } from '@/components/profile-icon';
import { Typography } from '@/components/ui/typography';
import type { MenuItem } from '@/constants/menu';
import palette from '@/constants/palette';

type MenuRowProps = {
  item: MenuItem;
  onPress: () => void;
  isLast?: boolean;
};

export function MenuRow({ item, onPress, isLast }: MenuRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed, !isLast && styles.rowBorder]}
      accessibilityRole="button"
      accessibilityLabel={item.label}>
      <View style={styles.leading}>
        <View style={styles.iconWrap}>
          <ProfileIcon name={item.icon} size={14} color={palette.gray[800]} />
        </View>
        <Typography variant="text" size="md" weight="regular" style={styles.label} numberOfLines={2}>
          {item.label}
        </Typography>
      </View>
      <View style={styles.chevronWrap}>
        <HwSymbol
          name="chevron.right"
          size={14}
          weight="semibold"
          tintColor={palette.gray[900]}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 56,
    gap: 12,
  },
  rowPressed: {
    backgroundColor: palette.gray[50],
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.gray[200],
  },
  leading: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minWidth: 0,
  },
  iconWrap: {
    width: 14,
    height: 14,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    color: palette.gray[900],
  },
  chevronWrap: {
    width: 14,
    height: 14,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
