import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { HwSymbol } from '@/components/ui/hw-symbol';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  Easing,
  FadeIn,
  FadeOut,
  runOnJS,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HwVideoPlayer } from '@/components/ui/hw-video-player';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import type { HdpMomentItem } from '@/types/hdp-moments';

const IMAGE_DURATION_MS = 5000;
const TAP_EDGE_RATIO = 0.33;
const SWIPE_DISTANCE = 56;
const SWIPE_DOWN_CLOSE = 90;
const PLAY_ICON_FLASH_MS = 700;
const PROGRESS_GRADIENT = ['#5EEAD4', '#38BDF8', '#A78BFA'] as const;

type HdpMomentsStoryViewerProps = {
  visible: boolean;
  moments: HdpMomentItem[];
  initialIndex?: number;
  propertyName: string;
  onClose: () => void;
};

type PlaybackIcon = 'pause' | 'play' | null;
type SegmentState = 'done' | 'active' | 'pending';

function ProgressSegment({
  state,
  progress,
}: {
  state: SegmentState;
  progress: SharedValue<number>;
}) {
  const fillStyle = useAnimatedStyle(() => {
    const fill =
      state === 'done' ? 1 : state === 'active' ? Math.min(Math.max(progress.value, 0), 1) : 0;
    return { width: `${fill * 100}%` };
  }, [state]);

  return (
    <View style={styles.segmentTrack}>
      <Animated.View style={[styles.segmentFillWrap, fillStyle]}>
        <LinearGradient
          colors={PROGRESS_GRADIENT}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.segmentFill}
        />
      </Animated.View>
    </View>
  );
}

function StoryProgressBar({
  count,
  activeIndex,
  progress,
}: {
  count: number;
  activeIndex: number;
  progress: SharedValue<number>;
}) {
  return (
    <View style={styles.progressRow}>
      {Array.from({ length: count }, (_, index) => {
        const state: SegmentState =
          index < activeIndex ? 'done' : index === activeIndex ? 'active' : 'pending';
        return <ProgressSegment key={index} state={state} progress={progress} />;
      })}
    </View>
  );
}

function CenterPlaybackIcon({ icon }: { icon: PlaybackIcon }) {
  if (!icon) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(120)}
      exiting={FadeOut.duration(180)}
      pointerEvents="none"
      style={styles.centerIconWrap}>
      <View style={styles.centerIconCircle}>
        <HwSymbol
          name={icon === 'pause' ? 'pause.fill' : 'play.fill'}
          size={28}
          tintColor={palette.white}
          style={icon === 'play' ? styles.playIconOffset : undefined}
        />
      </View>
    </Animated.View>
  );
}

export function HdpMomentsStoryViewer({
  visible,
  moments,
  initialIndex = 0,
  propertyName,
  onClose,
}: HdpMomentsStoryViewerProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(initialIndex);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [playbackIcon, setPlaybackIcon] = useState<PlaybackIcon>(null);
  const [storyEpoch, setStoryEpoch] = useState(0);
  const [canMountVideo, setCanMountVideo] = useState(false);

  const progress = useSharedValue(0);
  const onCloseRef = useRef(onClose);
  const momentsLengthRef = useRef(moments.length);
  const widthRef = useRef(width);
  const playIconTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdingRef = useRef(false);

  const current = moments[index];
  const isVideo = current?.mediaType === 'video';
  const videoUri = visible && isVideo ? current?.mediaUrl : undefined;

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    widthRef.current = width;
  }, [width]);

  useEffect(() => {
    if (!visible || !videoUri) {
      setCanMountVideo(false);
      return;
    }
    setCanMountVideo(false);
    const timer = setTimeout(() => setCanMountVideo(true), 120);
    return () => clearTimeout(timer);
  }, [visible, videoUri, index, storyEpoch]);

  useEffect(() => {
    momentsLengthRef.current = moments.length;
  }, [moments.length]);

  useEffect(() => {
    return () => {
      if (playIconTimerRef.current) clearTimeout(playIconTimerRef.current);
    };
  }, []);

  const clearPlayIconTimer = useCallback(() => {
    if (playIconTimerRef.current) {
      clearTimeout(playIconTimerRef.current);
      playIconTimerRef.current = null;
    }
  }, []);

  const flashPlayIcon = useCallback(() => {
    clearPlayIconTimer();
    setPlaybackIcon('play');
    playIconTimerRef.current = setTimeout(() => {
      setPlaybackIcon(null);
      playIconTimerRef.current = null;
    }, PLAY_ICON_FLASH_MS);
  }, [clearPlayIconTimer]);

  const goNext = useCallback(() => {
    setIndex((currentIndex) => {
      if (currentIndex >= momentsLengthRef.current - 1) {
        onCloseRef.current();
        return currentIndex;
      }
      return currentIndex + 1;
    });
  }, []);

  const goPrev = useCallback(() => {
    setIndex((currentIndex) => {
      if (currentIndex <= 0) {
        setStoryEpoch((epoch) => epoch + 1);
        return 0;
      }
      return currentIndex - 1;
    });
  }, []);

  const closeViewer = useCallback(() => {
    onCloseRef.current();
  }, []);

  const pauseStory = useCallback(() => {
    holdingRef.current = true;
    clearPlayIconTimer();
    setPaused(true);
    setPlaybackIcon('pause');
    cancelAnimation(progress);
  }, [clearPlayIconTimer, progress]);

  const handleVideoProgress = useCallback(
    (value: number) => {
      progress.value = value;
    },
    [progress],
  );

  const resumeStory = useCallback(() => {
    const wasHolding = holdingRef.current;
    holdingRef.current = false;
    setPaused(false);
    if (wasHolding && isVideo) {
      flashPlayIcon();
    } else {
      setPlaybackIcon(null);
    }
  }, [flashPlayIcon, isVideo]);

  const toggleMute = useCallback(() => {
    setMuted((currentMuted) => !currentMuted);
  }, []);

  const handleTapNav = useCallback(
    (x: number) => {
      if (x < widthRef.current * TAP_EDGE_RATIO) {
        goPrev();
      } else {
        goNext();
      }
    },
    [goNext, goPrev],
  );

  const finishImageStory = useCallback(() => {
    goNext();
  }, [goNext]);

  useEffect(() => {
    if (!visible) return;
    setIndex(Math.min(Math.max(initialIndex, 0), Math.max(moments.length - 1, 0)));
    setPaused(false);
    setPlaybackIcon(null);
    holdingRef.current = false;
    progress.value = 0;
  }, [visible, initialIndex, moments.length, progress]);

  useEffect(() => {
    progress.value = 0;
    setPlaybackIcon(null);
    holdingRef.current = false;
    setPaused(false);
  }, [index, storyEpoch, videoUri, progress]);

  useEffect(() => {
    if (!visible || !current || isVideo) {
      cancelAnimation(progress);
      return;
    }

    if (paused) {
      cancelAnimation(progress);
      return;
    }

    const remainingMs = Math.max((1 - progress.value) * IMAGE_DURATION_MS, 80);
    progress.value = withTiming(
      1,
      { duration: remainingMs, easing: Easing.linear },
      (finished) => {
        if (finished) runOnJS(finishImageStory)();
      },
    );

    return () => {
      cancelAnimation(progress);
    };
  }, [visible, index, storyEpoch, isVideo, paused, current, progress, finishImageStory]);

  const tapGesture = Gesture.Tap()
    .maxDuration(220)
    .onEnd((event) => {
      runOnJS(handleTapNav)(event.x);
    });

  const longPressGesture = Gesture.LongPress()
    .minDuration(140)
    .maxDistance(14)
    .onStart(() => {
      runOnJS(pauseStory)();
    })
    .onFinalize(() => {
      runOnJS(resumeStory)();
    });

  const panGesture = Gesture.Pan()
    .minDistance(24)
    .onEnd((event) => {
      const { translationX, translationY, velocityX, velocityY } = event;
      const absX = Math.abs(translationX);
      const absY = Math.abs(translationY);

      if (absY >= absX && (translationY > SWIPE_DOWN_CLOSE || velocityY > 900)) {
        runOnJS(closeViewer)();
        return;
      }

      if (absX > absY && (absX > SWIPE_DISTANCE || Math.abs(velocityX) > 700)) {
        if (translationX < 0) {
          runOnJS(goNext)();
        } else {
          runOnJS(goPrev)();
        }
      }
    });

  const composedGesture = Gesture.Race(
    panGesture,
    Gesture.Exclusive(longPressGesture, tapGesture),
  );

  if (!current) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
      statusBarTranslucent>
      <GestureHandlerRootView style={styles.root}>
        <StatusBar style="light" />
        <View style={styles.root}>
          {videoUri && canMountVideo ? (
            <HwVideoPlayer
              key={`${current.id}-${storyEpoch}-${videoUri}`}
              uri={videoUri}
              playing={visible && !paused}
              loop={false}
              muted={muted}
              style={styles.media}
              timeUpdateInterval={0.05}
              onProgress={handleVideoProgress}
              onEnded={goNext}
              onError={goNext}
            />
          ) : videoUri ? null : (
            <Image
              source={{ uri: current.mediaUrl || current.imageUri }}
              style={styles.media}
              contentFit="cover"
              transition={200}
            />
          )}

          <GestureDetector gesture={composedGesture}>
            <Animated.View style={styles.touchLayer} />
          </GestureDetector>

          <CenterPlaybackIcon key={playbackIcon ?? 'none'} icon={playbackIcon} />

          <View
            style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}
            pointerEvents="box-none">
            <StoryProgressBar
              count={moments.length}
              activeIndex={index}
              progress={progress}
            />

            <View style={styles.metaRow}>
              <View style={styles.metaCopy}>
                <Typography variant="text" size="sm" weight="bold" color={palette.white}>
                  {propertyName}
                </Typography>
                {current.label ? (
                  <Typography variant="text" size="xs" color="rgba(255,255,255,0.8)">
                    {current.label}
                  </Typography>
                ) : null}
              </View>

              {isVideo ? (
                <Pressable
                  onPress={toggleMute}
                  hitSlop={12}
                  style={styles.headerIconButton}
                  accessibilityRole="button"
                  accessibilityLabel={muted ? 'Unmute video' : 'Mute video'}>
                  <HwSymbol
                    name={muted ? 'speaker.slash.fill' : 'speaker.wave.2.fill'}
                    size={16}
                    tintColor={palette.white}
                  />
                </Pressable>
              ) : null}

              <Pressable
                onPress={onClose}
                hitSlop={12}
                style={styles.headerIconButton}
                accessibilityRole="button"
                accessibilityLabel="Close stories">
                <HwSymbol name="xmark" size={16} weight="bold" tintColor={palette.white} />
              </Pressable>
            </View>
          </View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.black,
  },
  media: {
    ...StyleSheet.absoluteFill,
  },
  touchLayer: {
    ...StyleSheet.absoluteFill,
  },
  centerIconWrap: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIconOffset: {
    marginLeft: 3,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    gap: 12,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 5,
  },
  segmentTrack: {
    flex: 1,
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.28)',
    overflow: 'hidden',
  },
  segmentFillWrap: {
    height: '100%',
    borderRadius: 999,
    overflow: 'hidden',
  },
  segmentFill: {
    ...StyleSheet.absoluteFill,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaCopy: {
    flex: 1,
    gap: 2,
  },
  headerIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
});
