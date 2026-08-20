import { type ComponentType, type ReactNode, useEffect, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView as RNKeyboardAvoidingView,
  Platform,
} from 'react-native';

type KeyboardProviderComponent = ComponentType<{
  children?: ReactNode;
  statusBarTranslucent?: boolean;
  navigationBarTranslucent?: boolean;
  preserveEdgeToEdge?: boolean;
  enabled?: boolean;
  preload?: boolean;
}>;

type KeyboardVisibilityState = {
  isVisible: boolean;
  height: number;
};

/**
 * Always use React Native keyboard APIs.
 * `react-native-keyboard-controller` is linked on device builds but not always
 * in the simulator, which caused OTP focus/typing to diverge across platforms.
 */
function FallbackKeyboardProvider({ children }: { children?: ReactNode }) {
  return children;
}

function useFallbackKeyboardState<T>(selector: (state: KeyboardVisibilityState) => T): T {
  const [state, setState] = useState<KeyboardVisibilityState>(() => ({
    isVisible: Keyboard.isVisible(),
    height: 0,
  }));

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvent, (event) => {
      setState({
        isVisible: true,
        height: event.endCoordinates.height,
      });
    });
    const hide = Keyboard.addListener(hideEvent, () => {
      setState({ isVisible: false, height: 0 });
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return selector(state);
}

export const KeyboardProvider: KeyboardProviderComponent = FallbackKeyboardProvider;

export const KeyboardAvoidingView = RNKeyboardAvoidingView;

export const useKeyboardState = useFallbackKeyboardState;
