import { SymbolView } from 'expo-symbols';
import { type ReactNode, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import palette from '@/constants/palette';

type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  showCloseButton?: boolean;
};

const ANIMATION_MS = 280;
const SHEET_TOP_RADIUS = 28;

export function BottomSheet({
  visible,
  onClose,
  children,
  showCloseButton = true,
}: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const progress = useSharedValue(0);
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      progress.value = withTiming(1, {
        duration: ANIMATION_MS,
        easing: Easing.out(Easing.cubic),
      });
      return;
    }

    if (mounted) {
      progress.value = withTiming(0, { duration: ANIMATION_MS }, (finished) => {
        if (finished) {
          runOnJS(setMounted)(false);
        }
      });
    }
  }, [mounted, progress, visible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value * 0.55,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * screenHeight }],
  }));

  function requestClose() {
    onClose();
  }

  if (!mounted) {
    return null;
  }

  return (
    <Modal
      transparent
      visible
      animationType="none"
      presentationStyle="overFullScreen"
      statusBarTranslucent
      onRequestClose={requestClose}>
      <View style={styles.root}>
        <Pressable
          style={styles.backdropPress}
          onPress={requestClose}
          accessibilityLabel="Close">
          <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]} />
        </Pressable>

        {showCloseButton ? (
          <Pressable
            onPress={requestClose}
            style={[styles.closeButton, { top: insets.top + 12 }]}
            accessibilityRole="button"
            accessibilityLabel="Close">
            <SymbolView name="xmark" size={14} weight="bold" tintColor={palette.white} />
          </Pressable>
        ) : null}

        {/* Transform stays on the outer view; radius/clip on the inner so corners render reliably. */}
        <Animated.View style={[styles.sheet, sheetStyle]}>
          <View style={styles.sheetSurface} collapsable={false}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
              style={styles.keyboardAvoid}>
              {children}
            </KeyboardAvoidingView>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  backdropPress: {
    flex: 1,
  },
  backdrop: {
    backgroundColor: palette.black,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    zIndex: 2,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(16, 24, 40, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheet: {
    maxHeight: '88%',
    width: '100%',
  },
  sheetSurface: {
    width: '100%',
    backgroundColor: palette.white,
    borderTopLeftRadius: SHEET_TOP_RADIUS,
    borderTopRightRadius: SHEET_TOP_RADIUS,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        borderCurve: 'continuous',
      },
      default: {},
    }),
  },
  keyboardAvoid: {
    width: '100%',
    maxHeight: '100%',
  },
});
