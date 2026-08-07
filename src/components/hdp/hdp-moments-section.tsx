import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { HwSymbol } from '@/components/ui/hw-symbol';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { HdpMomentsStoryViewer } from '@/components/hdp/hdp-moments-story-viewer';
import { HwCarousel } from '@/components/ui/carousel';
import { GradientText } from '@/components/ui/gradient-text';
import { Typography } from '@/components/ui/typography';
import { ImageAssets } from '@/constants/assets';
import palette from '@/constants/palette';
import { useIsTablet } from '@/hooks/use-is-tablet';
import type { HdpMomentItem } from '@/types/hdp-moments';
import { COMING_SOON_IMAGE_URI } from '@/utils/images';

const CARD_HEIGHT = 320;
const CARD_GAP = 12;
const MOMENTS_GRADIENT = [palette.lightBlue, palette.purpleScale[500]] as const;

type HdpMomentsSectionProps = {
  propertyName: string;
  moments: HdpMomentItem[];
  carouselWidth: number;
};

function hasUsableThumbnail(uri?: string) {
  const value = uri?.trim();
  if (!value) return false;
  if (value === COMING_SOON_IMAGE_URI) return false;
  if (value.includes('coming-soon')) return false;
  return true;
}

function MomentCard({
  moment,
  cardWidth,
  onPress,
}: {
  moment: HdpMomentItem;
  cardWidth: number;
  onPress: () => void;
}) {
  const isVideo = moment.mediaType === 'video';
  const [thumbFailed, setThumbFailed] = useState(false);
  const showThumbnail = hasUsableThumbnail(moment.imageUri) && !thumbFailed;

  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, { width: cardWidth }]}
      accessibilityRole="button"
      accessibilityLabel={
        isVideo ? `Open story video: ${moment.label}` : `Open story: ${moment.label}`
      }>
      <Image
        source={showThumbnail ? { uri: moment.imageUri } : ImageAssets.comingSoon}
        style={styles.cardImage}
        contentFit="cover"
        onError={() => setThumbFailed(true)}
      />
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.75)']}
        style={styles.cardOverlay}>
        <Typography variant="text" size="md" weight="bold" color={palette.white}>
          {moment.label}
        </Typography>
      </LinearGradient>

      {isVideo ? (
        <View style={styles.playBadge} pointerEvents="none">
          <View style={styles.playCircle}>
            <HwSymbol
              name="play.fill"
              size={28}
              tintColor={palette.white}
              style={styles.playIcon}
            />
          </View>
        </View>
      ) : null}
    </Pressable>
  );
}

export function HdpMomentsSection({ propertyName, moments, carouselWidth }: HdpMomentsSectionProps) {
  const [storyIndex, setStoryIndex] = useState<number | null>(null);
  const isTablet = useIsTablet();
  const visibleCards = isTablet ? 2 : 1;
  const cardWidth =
    visibleCards === 2 ? (carouselWidth - CARD_GAP) / 2 : carouselWidth - CARD_GAP;
  const slideWidth = cardWidth + CARD_GAP;
  const carouselWindowWidth = visibleCards === 2 ? carouselWidth : undefined;

  if (moments.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <View style={styles.titleRow}>
        <GradientText
          variant="text"
          size="xl"
          weight="bold"
          colors={MOMENTS_GRADIENT}
          style={styles.momentsWord}>
          Moments
        </GradientText>
        <Typography variant="text" size="xl" weight="bold" style={styles.titleSuffix}>
          {' '}
          at {propertyName}
        </Typography>
      </View>

      <HwCarousel
        data={moments}
        width={slideWidth}
        windowWidth={carouselWindowWidth}
        height={CARD_HEIGHT + 36}
        showPagination={moments.length > 1}
        style={styles.carousel}
        renderItem={({ item, index }) => (
          <MomentCard
            moment={item}
            cardWidth={cardWidth}
            onPress={() => setStoryIndex(index)}
          />
        )}
      />

      <HdpMomentsStoryViewer
        visible={storyIndex !== null}
        moments={moments}
        initialIndex={storyIndex ?? 0}
        propertyName={propertyName}
        onClose={() => setStoryIndex(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 16,
  },
  titleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
  },
  momentsWord: {
    fontStyle: 'italic',
  },
  titleSuffix: {
    color: palette.gray[900],
    flexShrink: 1,
  },
  carousel: {
    marginHorizontal: -4,
  },
  card: {
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: palette.gray[100],
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
  },
  playBadge: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    elevation: 4,
  },
  playCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 4,
  },
  playIcon: {
    width: 28,
    height: 28,
  },
});
