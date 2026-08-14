import { useRouter } from 'expo-router';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { PropertyCard } from '@/components/property/property-card';
import { HwParallaxCarousel } from '@/components/ui/carousel';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { useIsTablet } from '@/hooks/use-is-tablet';
import type { PropertyListing } from '@/types/property';

const ITEM_GAP = 10;
const PROPERTY_CAROUSEL_HEIGHT = 488;
const PARALLAX_MODE_CONFIG = {
  parallaxScrollingScale: 0.92,
  parallaxScrollingOffset: 28,
  parallaxAdjacentItemScale: 0.86,
};

type HdpSimilarPropertiesSectionProps = {
  listings: PropertyListing[];
};

export function HdpSimilarPropertiesSection({ listings }: HdpSimilarPropertiesSectionProps) {
  const router = useRouter();
  const isTablet = useIsTablet();
  const { width } = useWindowDimensions();
  const contentWidth = width - 48;
  const visibleCards = isTablet ? 2 : 1;
  const cardWidth =
    visibleCards === 2 ? (contentWidth - ITEM_GAP) / 2 : contentWidth;
  const slideWidth = cardWidth + ITEM_GAP;
  const carouselWindowWidth = visibleCards === 2 ? contentWidth : undefined;

  if (listings.length === 0) {
    return null;
  }

  function openProperty(item: PropertyListing) {
    const imageUri =
      typeof item.images[0] === 'object' && item.images[0] && 'uri' in item.images[0]
        ? item.images[0].uri
        : undefined;

    router.push({
      pathname: '/hdp',
      params: {
        id: item.id,
        name: item.name,
        image: imageUri,
      },
    });
  }

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Typography variant="text" size="xl" weight="bold">
          More Places you&apos;ll Like
        </Typography>
        <Typography variant="text" size="sm" color={palette.gray[600]}>
          {listings.length} similar {listings.length === 1 ? 'property' : 'properties'} nearby
        </Typography>
      </View>

      <HwParallaxCarousel
        data={listings}
        width={slideWidth}
        windowWidth={carouselWindowWidth}
        height={PROPERTY_CAROUSEL_HEIGHT}
        showPagination={false}
        modeConfig={isTablet ? undefined : PARALLAX_MODE_CONFIG}
        style={styles.carousel}
        renderItem={({ item }) => (
          <PropertyCard
            property={item}
            style={{ width: cardWidth, alignSelf: 'center' }}
            onPress={() => openProperty(item)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 16,
  },
  header: {
    gap: 4,
  },
  carousel: {
    marginHorizontal: -4,
  },
});
