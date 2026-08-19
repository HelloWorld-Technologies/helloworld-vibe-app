import { HwSymbol } from '@/components/ui/hw-symbol';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';

type TenantScreenHeaderProps = {
  title: string;
  onBack?: () => void;
  style?: ViewStyle;
};

export function TenantScreenHeader({ title, onBack, style }: TenantScreenHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top + 8 }, style]}>
      <View style={styles.row}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <HwSymbol name="chevron.left" size={16} tintColor={palette.black} />
          </Pressable>
        ) : null}
        <Typography variant="text" size="lg" weight="medium">
          {title}
        </Typography>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: palette.white,
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    width: 44,
    height: 42,
    borderRadius: Radius.full,
    borderWidth: 0.5,
    borderColor: palette.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.white,
  },
});
