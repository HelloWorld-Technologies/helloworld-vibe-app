import { Image, type ImageSource } from 'expo-image';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

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

  return (
    <View style={[styles.wrap, style]}>
      <Image
        source={source}
        style={styles.fill}
        contentFit="cover"
        recyclingKey={typeof imageUri === 'string' ? imageUri : imageKey}
        onError={() => {
          if (remoteSource) setFailed(true);
        }}
      />
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
});
