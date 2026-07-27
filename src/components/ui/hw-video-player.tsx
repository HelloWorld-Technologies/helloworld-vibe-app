import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import palette from '@/constants/palette';

type HwVideoPlayerProps = {
  uri: string;
  playing?: boolean;
  loop?: boolean;
  muted?: boolean;
  contentFit?: 'contain' | 'cover' | 'fill';
  style?: StyleProp<ViewStyle>;
  posterUri?: string;
  onReady?: () => void;
  onEnded?: () => void;
  onError?: () => void;
  timeUpdateInterval?: number;
  onProgress?: (progress: number) => void;
};

type Size = { width: number; height: number };

/**
 * expo-video wrapper that:
 * - sizes VideoView from onLayout (avoids black iOS layer with zero/undefined size)
 * - waits for `readyToPlay` before play()
 * - keeps poster under the video while the surface attaches
 */
export function HwVideoPlayer({
  uri,
  playing = true,
  loop = false,
  muted = true,
  contentFit = 'cover',
  style,
  posterUri,
  onReady,
  onEnded,
  onError,
  timeUpdateInterval = 0,
  onProgress,
}: HwVideoPlayerProps) {
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });
  const [ready, setReady] = useState(false);
  const [surfaceReady, setSurfaceReady] = useState(Platform.OS !== 'ios');
  const playingRef = useRef(playing);
  const onReadyRef = useRef(onReady);
  const onEndedRef = useRef(onEnded);
  const onErrorRef = useRef(onError);
  const onProgressRef = useRef(onProgress);

  playingRef.current = playing;
  onReadyRef.current = onReady;
  onEndedRef.current = onEnded;
  onErrorRef.current = onError;
  onProgressRef.current = onProgress;

  const player = useVideoPlayer(uri, (instance) => {
    instance.loop = loop;
    instance.muted = muted;
    if (timeUpdateInterval > 0) {
      instance.timeUpdateEventInterval = timeUpdateInterval;
    }
  });

  const hasSize = size.width > 0 && size.height > 0;

  function handleLayout(event: LayoutChangeEvent) {
    const { width, height } = event.nativeEvent.layout;
    if (width <= 0 || height <= 0) return;
    setSize((prev) =>
      prev.width === width && prev.height === height ? prev : { width, height },
    );
  }

  // iOS: mount VideoView only after we have a real layout size.
  useEffect(() => {
    if (Platform.OS !== 'ios') {
      setSurfaceReady(true);
      return;
    }
    if (!hasSize) {
      setSurfaceReady(false);
      return;
    }
    setSurfaceReady(false);
    const id = requestAnimationFrame(() => {
      setSurfaceReady(true);
    });
    return () => cancelAnimationFrame(id);
  }, [uri, hasSize, size.width, size.height]);

  useEffect(() => {
    setReady(false);
  }, [uri]);

  useEffect(() => {
    const statusSub = player.addListener('statusChange', ({ status, error }) => {
      if (status === 'readyToPlay') {
        setReady(true);
        onReadyRef.current?.();
        if (playingRef.current) {
          try {
            player.play();
          } catch {
            // ignore
          }
        }
      }
      if (status === 'error') {
        onErrorRef.current?.();
        if (__DEV__) {
          console.warn('[HwVideoPlayer] error', error);
        }
      }
    });

    const endSub = player.addListener('playToEnd', () => {
      onEndedRef.current?.();
    });

    const timeSub =
      timeUpdateInterval > 0
        ? player.addListener('timeUpdate', ({ currentTime }) => {
            const duration = player.duration;
            if (duration > 0) onProgressRef.current?.(Math.min(currentTime / duration, 1));
          })
        : null;

    if (player.status === 'readyToPlay') {
      setReady(true);
      onReadyRef.current?.();
      if (playingRef.current) {
        try {
          player.play();
        } catch {
          // ignore
        }
      }
    }

    return () => {
      statusSub.remove();
      endSub.remove();
      timeSub?.remove();
      try {
        player.pause();
      } catch {
        // ignore
      }
    };
  }, [player, timeUpdateInterval]);

  useEffect(() => {
    if (!ready || !surfaceReady) return;
    try {
      if (playing) player.play();
      else player.pause();
    } catch {
      // ignore
    }
  }, [playing, ready, surfaceReady, player]);

  useEffect(() => {
    player.muted = muted;
  }, [muted, player]);

  useEffect(() => {
    player.loop = loop;
  }, [loop, player]);

  return (
    <View style={[styles.root, style]} onLayout={handleLayout} collapsable={false}>
      {posterUri ? (
        <Image
          source={{ uri: posterUri }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
        />
      ) : null}

      {surfaceReady && hasSize ? (
        <VideoView
          style={{ width: size.width, height: size.height }}
          player={player}
          contentFit={contentFit}
          nativeControls={false}
          fullscreenOptions={{ enable: false }}
        />
      ) : null}

      {!ready ? (
        <View style={styles.loading} pointerEvents="none">
          <ActivityIndicator color={palette.white} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: palette.black,
    overflow: 'hidden',
  },
  loading: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
});
