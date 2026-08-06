import { HwSymbol } from '@/components/ui/hw-symbol';
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
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
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
const BACKDROP_OPACITY = 0.55;
const DISMISS_DISTANCE = 120;
const DISMISS_VELOCITY = 900;

export function BottomSheet({
  visible,
  onClose,
  children,
  showCloseButton = true,
}: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const progress = useSharedValue(0);
  const dragY = useSharedValue(0);
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      dragY.value = 0;
      progress.value = withTiming(1, {
        duration: ANIMATION_MS,
        easing: Easing.out(Easing.cubic),
      });
      return;
    }

    if (mounted) {
      dragY.value = withTiming(0, { duration: ANIMATION_MS });
      progress.value = withTiming(0, { duration: ANIMATION_MS }, (finished) => {
        if (finished) {
          runOnJS(setMounted)(false);
        }
      });
    }
  }, [dragY, mounted, progress, visible]);

  const backdropStyle = useAnimatedStyle(() => {
    const dragFade = 1 - Math.min(dragY.value / (screenHeight * 0.45), 1);
    return {
      opacity: progress.value * BACKDROP_OPACITY * dragFade,
    };
  });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * screenHeight + dragY.value }],
  }));

  function requestClose() {
    onClose();
  }

  function finishGestureClose() {
    progress.value = 0;
    dragY.value = 0;
    setMounted(false);
    onClose();
  }

  const panGesture = Gesture.Pan()
    .activeOffsetY(10)
    .failOffsetX([-20, 20])
    .onUpdate((event) => {
      dragY.value = Math.max(0, event.translationY);
    })
    .onEnd((event) => {
      const shouldClose =
        event.translationY > DISMISS_DISTANCE || event.velocityY > DISMISS_VELOCITY;

      if (shouldClose) {
        const dismissMs = Math.min(
          ANIMATION_MS,
          Math.max(160, 320 - event.velocityY / 10),
        );
        dragY.value = withTiming(screenHeight, { duration: dismissMs }, (finished) => {
          if (finished) {
            runOnJS(finishGestureClose)();
          }
        });
        progress.value = withTiming(0, { duration: dismissMs });
        return;
      }

      dragY.value = withTiming(0, {
        duration: ANIMATION_MS,
        easing: Easing.out(Easing.cubic),
      });
    });

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
      <GestureHandlerRootView style={styles.root}>
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}
        />

        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={requestClose}
          accessibilityLabel="Close"
        />

        {showCloseButton ? (
          <Pressable
            onPress={requestClose}
            style={[styles.closeButton, { top: insets.top + 12 }]}
            accessibilityRole="button"
            accessibilityLabel="Close">
            <HwSymbol name="xmark" size={14} weight="bold" tintColor={palette.white} />
          </Pressable>
        ) : null}

        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.sheetTranslate, sheetStyle]}>
            <View
              style={[styles.sheetSurface, { paddingBottom: Math.max(insets.bottom, 12) }]}
              collapsable={false}>
              <View style={styles.handleHitArea} accessibilityRole="adjustable">
                <View style={styles.handle} />
              </View>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
                style={styles.keyboardAvoid}>
                {children}
              </KeyboardAvoidingView>
            </View>
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
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
  sheetTranslate: {
    width: '100%',
    maxHeight: '88%',
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  sheetSurface: {
    width: '100%',
    backgroundColor: palette.white,
    borderTopLeftRadius: SHEET_TOP_RADIUS,
    borderTopRightRadius: SHEET_TOP_RADIUS,
    overflow: 'hidden',
  },
  handleHitArea: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    paddingBottom: 6,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: palette.gray[300],
  },
  keyboardAvoid: {
    width: '100%',
    maxHeight: '100%',
    backgroundColor: 'transparent',
  },
});
