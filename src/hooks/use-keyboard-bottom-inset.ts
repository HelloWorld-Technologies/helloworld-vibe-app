import { useEffect, useState } from 'react';
import { Keyboard, type KeyboardEvent, Platform } from 'react-native';

const KEYBOARD_GAP = 12;

/**
 * Bottom padding that keeps a pinned composer above the keyboard.
 * Android edge-to-edge often ignores adjustResize, so KeyboardAvoidingView
 * is not enough — pad from the keyboard event height instead.
 */
export function useKeyboardBottomInset(restingInset: number, keyboardGap = KEYBOARD_GAP) {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = (event: KeyboardEvent) => {
      setKeyboardHeight(event.endCoordinates.height);
    };

    const onHide = () => {
      setKeyboardHeight(0);
    };

    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);
    const changeSub =
      Platform.OS === 'ios' ? Keyboard.addListener('keyboardWillChangeFrame', onShow) : null;

    return () => {
      showSub.remove();
      hideSub.remove();
      changeSub?.remove();
    };
  }, []);

  if (keyboardHeight > 0) {
    return Math.max(keyboardHeight, keyboardGap);
  }

  return restingInset;
}
