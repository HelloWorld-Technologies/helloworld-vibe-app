import { type ImageSource } from 'expo-image';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { RemoteImageWithSkeleton } from '@/components/ui/remote-image-with-skeleton';
import { ImageAssets } from '@/constants/assets';
import { formatLocalityImageUrl } from '@/utils/images';

type ImageAssetKey = keyof typeof ImageAssets;

type LocalityCardImageProps = {
  /** Showcase / demo only — never used for API popular-locality covers. */
  imageKey?: ImageAssetKey;
  imageUri?: string | null;
  style?: StyleProp<ViewStyle>;
};

const COMING_SOON_SOURCE: ImageSource = ImageAssets.comingSoon;

function resolveRemoteImageSource(
  imageKey?: ImageAssetKey,
  imageUri?: string | null,
): ImageSource | null {
  const uri = formatLocalityImageUrl(imageUri);
  if (uri) return { uri };

  // Bundled demo keys (showcase). Prefer API imageUri; never use these when
  // a cover URL was provided but failed validation.
  if (!imageUri?.trim() && imageKey && imageKey in ImageAssets && imageKey !== 'comingSoon') {
    return ImageAssets[imageKey];
  }

  return null;
}

export function LocalityCardImage({ imageKey, imageUri, style }: LocalityCardImageProps) {
  const remoteSource = useMemo(
    () => resolveRemoteImageSource(imageKey, imageUri),
    [imageKey, imageUri],
  );
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [imageKey, imageUri]);

  const source = remoteSource && !failed ? remoteSource : COMING_SOON_SOURCE;

  const cacheKey =
    remoteSource && typeof remoteSource === 'object' && 'uri' in remoteSource
      ? remoteSource.uri
      : imageKey;

  return (
    <RemoteImageWithSkeleton
      source={source}
      style={[styles.wrap, style]}
      contentFit="cover"
      recyclingKey={cacheKey ?? 'locality-fallback'}
      transition={0}
      onError={() => {
        if (remoteSource) setFailed(true);
      }}
    />
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    height: '100%',
  },
});
