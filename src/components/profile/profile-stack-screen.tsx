import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HwSymbol } from '@/components/ui/hw-symbol';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';

type ProfileStackScreenProps = ViewProps & {
  title: string;
  children: React.ReactNode;
  centerTitle?: boolean;
};

export function ProfileStackScreen({
  title,
  children,
  centerTitle = false,
  style,
  ...props
}: ProfileStackScreenProps) {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <HwSymbol name="chevron.left" size={18} weight="semibold" tintColor={palette.gray[800]} />
        </Pressable>
        {centerTitle ? (
          <>
            <Typography variant="text" size="lg" weight="bold" style={styles.centeredTitle}>
              {title}
            </Typography>
            <View style={styles.headerSpacer} />
          </>
        ) : (
          <Typography variant="text" size="lg" weight="bold">
            {title}
          </Typography>
        )}
      </View>
      <View style={[styles.body, style]} {...props}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.gray[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  headerSpacer: {
    width: 40,
  },
  centeredTitle: {
    flex: 1,
    textAlign: 'center',
    color: palette.black,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  backButtonPressed: {
    opacity: 0.85,
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
});
