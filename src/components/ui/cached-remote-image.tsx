import { Image, type ImageContentFit, type ImageSource } from 'expo-image';
import { useEffect, useState } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';

import { ImageAssets } from '@/constants/assets';
import { markImageUriLoaded } from '@/utils/image-cache';

const DEFAULT_FALLBACK: ImageSource = ImageAssets.comingSoon;

type CachedRemoteImageProps = {
  uri?: string | null;
  recyclingKey?: string;
  style?: StyleProp<ViewStyle>;
  contentFit?: ImageContentFit;
  fallbackSource?: ImageSource;
  transition?: number;
};

export function CachedRemoteImage({
  uri,
  recyclingKey,
  style,
  contentFit = 'cover',
  fallbackSource = DEFAULT_FALLBACK,
  transition = 0,
}: CachedRemoteImageProps) {
  const trimmed = uri?.trim() ?? '';
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [uri]);

  const hasRemote = trimmed.length > 0 && !failed;

  return (
    <Image
      source={
        hasRemote
          ? { uri: trimmed, cacheKey: trimmed }
          : fallbackSource
      }
      style={style}
      contentFit={contentFit}
      cachePolicy="memory-disk"
      recyclingKey={recyclingKey ?? (trimmed || 'fallback')}
      transition={transition}
      onLoad={() => {
        if (trimmed) markImageUriLoaded(trimmed);
      }}
      onError={() => {
        if (trimmed) setFailed(true);
      }}
    />
  );
}
