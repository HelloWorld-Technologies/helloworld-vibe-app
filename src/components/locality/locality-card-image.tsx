import { Image, type ImageSource } from 'expo-image';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ImageAssets } from '@/constants/assets';
import { formatPropertyImageUrl } from '@/utils/images';

type ImageAssetKey = keyof typeof ImageAssets;

type LocalityCardImageProps = {
  imageKey?: ImageAssetKey;
  imageUri?: string | null;
  style?: StyleProp<ViewStyle>;
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
  const [remoteReady, setRemoteReady] = useState(false);

  useEffect(() => {
    setUseFallback(false);
    setRemoteReady(false);
  }, [imageKey, imageUri]);

  const showRemote = Boolean(remoteSource) && !useFallback && remoteReady;

  return (
    <View style={[styles.wrap, style]}>
      <Image source={COMING_SOON_SOURCE} style={styles.fill} contentFit="cover" />
      {remoteSource && !useFallback ? (
        <Image
          source={remoteSource}
          style={[styles.fill, showRemote ? null : styles.hidden]}
          contentFit="cover"
          onLoad={() => setRemoteReady(true)}
          onError={() => setUseFallback(true)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  fill: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  hidden: {
    opacity: 0,
  },
});
