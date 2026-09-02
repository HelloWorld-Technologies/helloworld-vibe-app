import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { Modal, Platform, StyleSheet, View } from 'react-native';
import {
  initialWindowMetrics,
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { ErrorStateAssets } from '@/constants/assets';
import palette from '@/constants/palette';
import { Spacing } from '@/constants/theme';

type NoInternetModalProps = {
  visible: boolean;
  isRetrying?: boolean;
  onTryAgain: () => void;
};

function NoInternetModalContent({
  isRetrying,
  onTryAgain,
}: Pick<NoInternetModalProps, 'isRetrying' | 'onTryAgain'>) {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(
    insets.bottom,
    initialWindowMetrics?.insets.bottom ?? 0,
    Platform.OS === 'android' ? 24 : 12,
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <Image
          source={ErrorStateAssets.noInternet}
          style={styles.illustration}
          contentFit="contain"
          accessibilityIgnoresInvertColors
          accessibilityLabel="No internet connection"
        />

        <Typography
          variant="text"
          size="md"
          color={palette.gray[700]}
          style={styles.message}>
          Check your wifi or data and try again. Our dog is sitting by the door, ready to go.
        </Typography>
      </View>

      <View style={[styles.actions, { paddingBottom: bottomInset + Spacing.three }]}>
        <Button
          label="Try again"
          loading={isRetrying}
          onPress={onTryAgain}
          style={styles.button}
        />
      </View>
    </View>
  );
}

export function NoInternetModal({ visible, isRetrying, onTryAgain }: NoInternetModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      statusBarTranslucent
      onRequestClose={onTryAgain}>
      <StatusBar style="dark" />
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <NoInternetModalContent isRetrying={isRetrying} onTryAgain={onTryAgain} />
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.white,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  illustration: {
    width: 222,
    height: 230,
  },
  message: {
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },
  actions: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  button: {
    width: '100%',
  },
});
