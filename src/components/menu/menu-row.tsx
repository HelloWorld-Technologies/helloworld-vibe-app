import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { HwSymbol } from '@/components/ui/hw-symbol';
import { ProfileIcon } from '@/components/profile-icon';
import { Typography } from '@/components/ui/typography';
import type { MenuItem } from '@/constants/menu';
import palette from '@/constants/palette';

const ROW_ENTER_MS = 220;
const ROW_STAGGER_MS = 40;

type MenuRowProps = {
  item: MenuItem;
  onPress: () => void;
  isLast?: boolean;
  index?: number;
  animateOnMount?: boolean;
};

function MenuRowContent({
  item,
  onPress,
  isLast,
}: Pick<MenuRowProps, 'item' | 'onPress' | 'isLast'>) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed, !isLast && styles.rowBorder]}
      accessibilityRole="button"
      accessibilityLabel={item.label}>
      <View style={styles.leading}>
        <View style={styles.iconWrap}>
          <ProfileIcon name={item.icon} size={22} color={palette.gray[800]} />
        </View>
        <Typography variant="text" size="md" weight="medium" style={styles.label} numberOfLines={2}>
          {item.label}
        </Typography>
      </View>
      <View style={styles.chevronWrap}>
        <HwSymbol
          name="chevron.right"
          size={14}
          weight="semibold"
          tintColor={palette.gray[400]}
        />
      </View>
    </Pressable>
  );
}

export function MenuRow({
  item,
  onPress,
  isLast,
  index = 0,
  animateOnMount = true,
}: MenuRowProps) {
  if (!animateOnMount) {
    return <MenuRowContent item={item} onPress={onPress} isLast={isLast} />;
  }

  return (
    <Animated.View entering={FadeInDown.duration(ROW_ENTER_MS).delay(index * ROW_STAGGER_MS)}>
      <MenuRowContent item={item} onPress={onPress} isLast={isLast} />
    </Animated.View>
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
    width: 22,
    height: 22,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    color: palette.gray[900],
  },
  chevronWrap: {
    width: 16,
    height: 16,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
