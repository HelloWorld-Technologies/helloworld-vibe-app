import { HwSymbol } from '@/components/ui/hw-symbol';
import { type ReactNode, useEffect, useState } from 'react';
import {
  Keyboard,
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
import {
  SafeAreaProvider,
  initialWindowMetrics,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

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
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Modal can report 0 bottom inset on Android — fall back to window metrics.
  // Keep a larger Android minimum so the CTA is not in the system nav / gesture zone.
  const bottomInset = Math.max(
    insets.bottom,
    initialWindowMetrics?.insets.bottom ?? 0,
    Platform.OS === 'android' ? 24 : 12,
  );

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

  // Transparent Modal often ignores adjustResize on Android — pad manually.
  useEffect(() => {
    if (!visible) {
      setKeyboardHeight(0);
      return;
    }

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [visible]);

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
    Keyboard.dismiss();
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
    .enabled(keyboardHeight === 0)
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

  const sheetMaxHeight = screenHeight * 0.88;
  // Lift sheet above keyboard.
  const keyboardPad = keyboardHeight > 0 ? keyboardHeight : 0;

  return (
    <Modal
      transparent
      visible
      animationType="none"
      presentationStyle="overFullScreen"
      statusBarTranslucent
      onRequestClose={requestClose}>
      {/*
        Provider lives INSIDE the Modal only. Wrapping outside caused an empty
        flex:1 SafeAreaProvider view on the host screen (tab bar mid-screen).
      */}
      <SafeAreaProvider
        initialMetrics={initialWindowMetrics}
        style={styles.modalSafeArea}>
        <GestureHandlerRootView style={styles.root}>
          <Animated.View
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}
          />

          <Pressable
            style={styles.dismissArea}
            onPress={() => {
              if (keyboardHeight > 0) {
                Keyboard.dismiss();
                return;
              }
              requestClose();
            }}
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

          <Animated.View
            style={[
              styles.sheetTranslate,
              {
                maxHeight: sheetMaxHeight,
                marginBottom: keyboardPad,
              },
              sheetStyle,
            ]}>
            <View
              style={[
                styles.sheetSurface,
                {
                  paddingBottom: keyboardPad > 0 ? 12 : bottomInset,
                  maxHeight: sheetMaxHeight,
                },
              ]}
              collapsable={false}>
              <GestureDetector gesture={panGesture}>
                <View
                  style={styles.handleHitArea}
                  accessibilityRole="adjustable"
                  collapsable={false}>
                  <View style={styles.handle} />
                </View>
              </GestureDetector>
              {/*
                Sheet already lifts via marginBottom = keyboard height.
                Extra KeyboardAvoidingView padding on iOS doubles the offset
                and leaves a large blank band above the keyboard.
              */}
              <View style={styles.sheetBody}>{children}</View>
            </View>
          </Animated.View>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalSafeArea: {
    flex: 1,
  },
  root: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  backdrop: {
    backgroundColor: palette.black,
  },
  dismissArea: {
    flex: 1,
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
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  sheetSurface: {
    width: '100%',
    backgroundColor: palette.white,
    borderTopLeftRadius: SHEET_TOP_RADIUS,
    borderTopRightRadius: SHEET_TOP_RADIUS,
    overflow: 'hidden',
    elevation: 8,
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
  sheetBody: {
    width: '100%',
    flexShrink: 1,
    backgroundColor: 'transparent',
  },
});
