import { Image, type ImageContentFit, type ImageSource } from 'expo-image';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ImageSkeleton } from '@/components/ui/image-skeleton';
import {
  isImageUriLoaded,
  markImageUriLoaded,
  probeImageDiskCache,
} from '@/utils/image-cache';

function isRemoteSource(source: ImageSource | null | undefined): source is { uri: string } {
  return (
    source != null &&
    typeof source === 'object' &&
    'uri' in source &&
    typeof source.uri === 'string' &&
    source.uri.length > 0
  );
}

function sourceKey(source: ImageSource | null | undefined): string {
  if (!source) return '';
  if (typeof source === 'number') return String(source);
  if (typeof source === 'object' && 'uri' in source) return source.uri ?? '';
  return '';
}

function withStableCacheKey(source: ImageSource, cacheKey: string): ImageSource {
  if (!cacheKey || typeof source === 'number') return source;
  if (typeof source === 'object' && 'uri' in source) {
    return { ...source, uri: source.uri, cacheKey };
  }
  return source;
}

type RemoteImageWithSkeletonProps = {
  source?: ImageSource | null;
  style?: StyleProp<ViewStyle>;
  contentFit?: ImageContentFit;
  recyclingKey?: string;
  transition?: number;
  cachePolicy?: 'none' | 'disk' | 'memory' | 'memory-disk';
  onError?: () => void;
};

export function RemoteImageWithSkeleton({
  source,
  style,
  contentFit = 'cover',
  recyclingKey,
  transition = 200,
  cachePolicy = 'memory-disk',
  onError,
}: RemoteImageWithSkeletonProps) {
  const key = useMemo(() => sourceKey(source), [source]);
  const remote = isRemoteSource(source);
  const [loaded, setLoaded] = useState(() => remote && isImageUriLoaded(key));

  useEffect(() => {
    if (!remote || !key) {
      setLoaded(false);
      return;
    }

    if (isImageUriLoaded(key)) {
      setLoaded(true);
      return;
    }

    setLoaded(false);
    let cancelled = false;

    void probeImageDiskCache(key).then((cached) => {
      if (!cancelled && cached) setLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, [key, remote]);

  const showSkeleton = remote && !loaded;
  const hasSource = source != null;
  const resolvedSource = useMemo(
    () => (hasSource && key ? withStableCacheKey(source, key) : source),
    [hasSource, key, source],
  );

  return (
    <View style={[styles.wrap, style]}>
      {showSkeleton ? (
        <ImageSkeleton width="100%" height="100%" borderRadius={0} style={styles.skeleton} />
      ) : null}
      {hasSource ? (
        <Image
          source={resolvedSource}
          style={styles.image}
          contentFit={contentFit}
          cachePolicy={cachePolicy}
          recyclingKey={recyclingKey ?? (key || 'fallback')}
          transition={loaded ? 0 : transition}
          onLoad={() => {
            if (key) markImageUriLoaded(key);
            setLoaded(true);
          }}
          onError={() => {
            setLoaded(true);
            onError?.();
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
  },
  skeleton: {
    ...StyleSheet.absoluteFillObject,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
});
