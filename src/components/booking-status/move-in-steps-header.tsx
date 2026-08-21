import { HwSymbol } from '@/components/ui/hw-symbol';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';

type MoveInStepsHeaderProps = {
  onBack: () => void;
  title?: string;
};

export function MoveInStepsHeader({ onBack, title = 'Your Move-in Steps' }: MoveInStepsHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top + 8 }]}>
      <View style={styles.row}>
        <View style={styles.left}>
          <Pressable
            onPress={onBack}
            style={({ pressed }) => [styles.backButton, pressed && styles.backPressed]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}>
            <HwSymbol name="chevron.left" size={16} weight="semibold" tintColor={palette.gray[900]} />
          </Pressable>
          <Typography variant="text" size="lg" weight="medium">
            {title}
          </Typography>
        </View>

        <Pressable
          onPress={() => router.navigate('/(tabs)/support')}
          style={styles.supportButton}
          accessibilityRole="button"
          accessibilityLabel="Support">
          <HwSymbol name="headphones" size={12} tintColor={palette.blue[700]} />
          <Typography variant="text" size="xs" weight="medium" color={palette.blue[700]}>
            Support
          </Typography>
        </Pressable>
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
    justifyContent: 'space-between',
    gap: 12,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
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
  backPressed: {
    opacity: 0.88,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 4,
  },
});
