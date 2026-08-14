import { Image, type ImageSource, type ImageStyle } from 'expo-image';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, type StyleProp } from 'react-native';

import { ImageAssets } from '@/constants/assets';
import { formatPropertyImageUrl } from '@/utils/images';

type ImageAssetKey = keyof typeof ImageAssets;

type LocalityCardImageProps = {
  imageKey?: ImageAssetKey;
  imageUri?: string | null;
  style?: StyleProp<ImageStyle>;
};

const COMING_SOON_SOURCE: ImageSource = ImageAssets.comingSoon;

function isUsableImageUri(imageUri?: string | null) {
  const value = imageUri?.trim();
  if (!value) return false;
  if (value === 'null' || value === 'undefined' || value === 'none') return false;
  if (value.includes('coming-soon')) return false;
  return true;
}

function resolveRemoteImageSource(
  imageKey?: ImageAssetKey,
  imageUri?: string | null,
): ImageSource | null {
  if (isUsableImageUri(imageUri)) {
    const raw = imageUri!.trim();
    const uri =
      raw.startsWith('http') || raw.startsWith('file:')
        ? raw
        : formatPropertyImageUrl(raw, 'srp');
    if (!uri || uri.includes('coming-soon')) return null;
    return { uri };
  }

  if (imageKey && imageKey in ImageAssets && imageKey !== 'comingSoon') {
    return ImageAssets[imageKey];
  }

  return null;
}

export function LocalityCardImage({ imageKey, imageUri, style }: LocalityCardImageProps) {
  const remoteSource = useMemo(
    () => resolveRemoteImageSource(imageKey, imageUri),
    [imageKey, imageUri],
  );
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    setUseFallback(false);
  }, [imageKey, imageUri]);

  const showRemote = Boolean(remoteSource) && !useFallback;

  return (
    <View style={[styles.wrap, style]}>
      <Image source={COMING_SOON_SOURCE} style={styles.fill} contentFit="cover" />
      {showRemote ? (
        <Image
          source={remoteSource}
          style={styles.fill}
          contentFit="cover"
          onError={() => setUseFallback(true)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  fill: {
    ...StyleSheet.absoluteFillObject,
  },
});
