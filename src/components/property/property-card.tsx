import { Image, type ImageSource } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState } from 'react';
import { LayoutAnimation, Platform, Pressable, StyleSheet, Text, UIManager, View, type StyleProp, type ViewStyle } from 'react-native';
import type { ICarouselInstance } from 'react-native-reanimated-carousel';

import { HwSymbol } from '@/components/ui/hw-symbol';
import { HwCarousel } from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { WishlistHeartButton } from '@/components/wishlist/wishlist-heart-button';
import { fontStyleForWeight } from '@/constants/fonts';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import { useOptionalPropertyActions } from '@/providers/property-actions-provider';
import { useOptionalWishlist } from '@/providers/wishlist-provider';
import { useSelectedCity } from '@/stores/auth-store';
import type { PropertyBadge, PropertyListing } from '@/types/property';
import { COMING_SOON_IMAGE_URI } from '@/utils/images';
import { getImageUriFromSource, shareProperty } from '@/utils/share-property';
import { SHARE_SYMBOL } from '@/constants/symbols';

if (Platform.OS === 'ios' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const MEDIA_HEIGHT = 220;
const MAX_CAROUSEL_IMAGES = 4;

type PropertyCardImageSlide = {
  id: string;
  source: ImageSource;
};

function toCarouselSlides(propertyId: string | number, images: PropertyListing['images']): PropertyCardImageSlide[] {
  return resolvePropertyImages(images)
    .slice(0, MAX_CAROUSEL_IMAGES)
    .map((source, index) => ({
      id: `${propertyId}-${index}`,
      source,
    }));
}

function resolvePropertyImages(images: PropertyListing['images']) {
  const validImages = images.filter((image) => {
    if (typeof image === 'number') return true;
    if (typeof image === 'object' && image !== null && 'uri' in image) {
      return Boolean(image.uri);
    }
    return true;
  });

  if (validImages.length > 0) {
    return validImages;
  }

  return [{ uri: COMING_SOON_IMAGE_URI }];
}

type PropertyCardProps = {
  property: PropertyListing;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  onRequestCallback?: () => void;
  onTakeTour?: () => void;
  onFavoritePress?: () => void;
  onSharePress?: () => void;
  isFavorite?: boolean;
  /** Share + wishlist heart color when inactive (default gray). */
  actionIconColor?: string;
  /** Skip inner image carousel — used on HDP similar properties to avoid nested carousels. */
  compactMedia?: boolean;
};

function formatRent(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

function BadgePill({
  badge,
  style,
}: {
  badge: PropertyBadge;
  style?: StyleProp<ViewStyle>;
}) {
  const isFillingFast = badge.variant === 'filling-fast';

  return (
    <View style={[styles.badge, isFillingFast ? styles.badgeOrange : styles.badgePink, style]}>
      {isFillingFast ? (
        <HwSymbol name="exclamationmark.triangle.fill" size={12} tintColor="#B54708" />
      ) : null}
      <Text style={[styles.badgeText, isFillingFast ? styles.badgeTextOrange : styles.badgeTextPink]}>
        {badge.label}
      </Text>
    </View>
  );
}

export function PropertyCard({
  property,
  style,
  onPress,
  onRequestCallback,
  onTakeTour,
  onFavoritePress,
  onSharePress,
  isFavorite,
  actionIconColor = palette.gray[800],
  compactMedia = false,
}: PropertyCardProps) {
  const wishlist = useOptionalWishlist();
  const propertyActions = useOptionalPropertyActions();
  const city = useSelectedCity();
  const propertyId = Number(property.id);
  const favorited = isFavorite ?? (Number.isFinite(propertyId) ? wishlist?.isWishlisted(propertyId) : false);
  const ratingValue = Number(property.rating);
  const displayRating = Number.isFinite(ratingValue) ? ratingValue : 4.5;

  const cardImages = toCarouselSlides(property.id, property.images);
  const imageCount = cardImages.length;
  const carouselRef = useRef<ICarouselInstance>(null);
  const [carouselWidth, setCarouselWidth] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const [loadedIndexes, setLoadedIndexes] = useState<Set<number>>(() => new Set([0]));
  const [failedIndexes, setFailedIndexes] = useState<Set<number>>(new Set());

  function markIndexLoaded(index: number) {
    setLoadedIndexes((current) => {
      if (current.has(index)) return current;
      const next = new Set(current);
      next.add(index);
      return next;
    });
  }

  function handleImageIndexChange(index: number) {
    if (Platform.OS === 'ios') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    setImageIndex(index);
    markIndexLoaded(index);
  }

  function showPreviousImage() {
    if (imageCount <= 1) return;
    markIndexLoaded((imageIndex - 1 + imageCount) % imageCount);
    carouselRef.current?.scrollTo({ count: -1, animated: true });
  }

  function showNextImage() {
    if (imageCount <= 1) return;
    markIndexLoaded((imageIndex + 1) % imageCount);
    carouselRef.current?.scrollTo({ count: 1, animated: true });
  }

  function resolveSlideSource(index: number, source: ImageSource) {
    if (failedIndexes.has(index)) {
      return { uri: COMING_SOON_IMAGE_URI };
    }
    return source;
  }

  function handleFavoritePress() {
    if (onFavoritePress) {
      onFavoritePress();
      return;
    }
    if (Number.isFinite(propertyId)) {
      void wishlist?.toggleWishlist(propertyId, property.name);
    }
  }

  function handleSharePress() {
    if (onSharePress) {
      onSharePress();
      return;
    }
    void shareProperty({
      name: property.slugName || property.name,
      displayName: property.name,
      id: property.id,
      city: property.city || city,
      locality: property.locality,
    });
  }

  function handleRequestCallback() {
    if (onRequestCallback) {
      onRequestCallback();
      return;
    }
    if (!Number.isFinite(propertyId)) return;
    propertyActions?.openRequestCallback({
      propertyId,
      propertyName: property.name,
      location: property.location,
      city,
    });
  }

  function handleTakeTour() {
    if (onTakeTour) {
      onTakeTour();
      return;
    }
    if (!Number.isFinite(propertyId)) return;
    propertyActions?.openScheduleVisit({
      propertyId,
      propertyName: property.name,
      location: property.location,
      city,
      startingRent: property.startingRent,
      imageUri: getImageUriFromSource(cardImages[0]?.source),
    });
  }

  return (
    <View style={[styles.cardShadow, style]}>
      <View style={styles.card}>
        <Pressable
          onPress={onPress}
          style={({ pressed }) => [pressed && onPress ? styles.cardPressed : null]}
          accessibilityRole={onPress ? 'button' : undefined}>
          <View
            style={styles.mediaSection}
            onLayout={(event) => setCarouselWidth(event.nativeEvent.layout.width)}>
            {imageCount === 1 || compactMedia ? (
              <Image
                source={resolveSlideSource(0, cardImages[0]?.source ?? { uri: COMING_SOON_IMAGE_URI })}
                style={styles.heroImage}
                contentFit="cover"
                cachePolicy="memory-disk"
                recyclingKey={`${property.id}-0`}
                transition={0}
                onError={() => setFailedIndexes((current) => new Set(current).add(0))}
              />
            ) : carouselWidth > 0 ? (
              <HwCarousel
                data={cardImages}
                width={carouselWidth}
                height={MEDIA_HEIGHT}
                loop
                showPagination={false}
                carouselRef={carouselRef}
                onSnapToItem={handleImageIndexChange}
                style={styles.carousel}
                renderItem={({ item, index }) => (
                  <Image
                    source={
                      loadedIndexes.has(index)
                        ? resolveSlideSource(index, item.source)
                        : null
                    }
                    style={[styles.heroImage, { width: carouselWidth, height: MEDIA_HEIGHT }]}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    recyclingKey={`${property.id}-${index}`}
                    transition={0}
                    onError={() =>
                      setFailedIndexes((current) => new Set(current).add(index))
                    }
                  />
                )}
              />
            ) : (
              <Image
                source={resolveSlideSource(0, cardImages[0]?.source ?? { uri: COMING_SOON_IMAGE_URI })}
                style={styles.heroImage}
                contentFit="cover"
                cachePolicy="memory-disk"
                recyclingKey={`${property.id}-0`}
                transition={0}
                onError={() => setFailedIndexes((current) => new Set(current).add(0))}
              />
            )}

            {imageCount > 1 && !compactMedia ? (
              <>
                <Pressable
                  onPress={(event) => {
                    event.stopPropagation();
                    showPreviousImage();
                  }}
                  style={[styles.carouselButton, styles.carouselButtonLeft]}
                  accessibilityRole="button"
                  accessibilityLabel="Previous photo">
                  <HwSymbol name="chevron.left" size={14} weight="semibold" tintColor={palette.white} />
                </Pressable>
                <Pressable
                  onPress={(event) => {
                    event.stopPropagation();
                    showNextImage();
                  }}
                  style={[styles.carouselButton, styles.carouselButtonRight]}
                  accessibilityRole="button"
                  accessibilityLabel="Next photo">
                  <HwSymbol name="chevron.right" size={14} weight="semibold" tintColor={palette.white} />
                </Pressable>
                <View style={styles.dotsRow}>
                  {cardImages.map((slide, index) => (
                    <View
                      key={slide.id}
                      style={[styles.dot, index === imageIndex ? styles.dotActive : null]}
                    />
                  ))}
                </View>
              </>
            ) : null}

        {property.badges && property.badges.length > 0 ? (
          <View style={styles.badgesOverlay} pointerEvents="box-none">
            {property.badges.map((badge) => (
              <BadgePill
                key={`${property.id}-${badge.label}`}
                badge={badge}
                style={badge.variant === 'gender' ? styles.badgeRight : styles.badgeLeft}
              />
            ))}
          </View>
        ) : null}
      </View>

      {property.vibeMatchPercent != null && property.vibeMatchPercent > 0 ? (
        <LinearGradient
          colors={['#7C3AED', '#38BDF8']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.vibeBar}>
          <Text style={styles.vibeText}>
            ✨ {Math.round(property.vibeMatchPercent)}% Vibe Match
          </Text>
        </LinearGradient>
      ) : null}

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {property.name}
          </Text>
          <View style={styles.ratingPill}>
            <Text style={styles.ratingText}>
              {displayRating.toFixed(1)} ★
            </Text>
          </View>
        </View>

        <View style={styles.subtitleRow}>
          <Text style={styles.subtitle} numberOfLines={1}>
            {property.location}
          </Text>
          <View style={styles.iconActions}>
            <WishlistHeartButton
              isFavorite={favorited}
              inactiveColor={actionIconColor}
              stopPropagation
              onPress={handleFavoritePress}
            />
            <Pressable
              onPress={(event) => {
                event.stopPropagation();
                handleSharePress();
              }}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Share property">
              <HwSymbol name={SHARE_SYMBOL} size={20} tintColor={actionIconColor} />
            </Pressable>
          </View>
        </View>

        <View style={styles.roomTypesPill}>
          <HwSymbol name="bed.double.fill" size={16} tintColor={palette.gray[700]} />
          <Text style={styles.roomTypesText} numberOfLines={1}>
            {property.roomTypes.join(' · ')}
          </Text>
        </View>

        <View style={styles.rentBlock}>
          <Text style={styles.rentLabel}>Starting Rent</Text>
          <Text style={styles.rentValue}>{formatRent(property.startingRent)}</Text>
        </View>
      </View>
        </Pressable>

        <View style={styles.actionsRow}>
          <Button
            label="Request Callback"
            variant="outline"
            onPress={(event) => {
              event.stopPropagation();
              handleRequestCallback();
            }}
            style={styles.actionButton}
          />
          <Button
            label="Take a Tour"
            onPress={(event) => {
              event.stopPropagation();
              handleTakeTour();
            }}
            style={styles.actionButton}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardShadow: {
    borderRadius: 16,
    backgroundColor: palette.white,
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },
  card: {
    backgroundColor: palette.white,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardPressed: {
    opacity: 0.96,
  },
  mediaSection: {
    position: 'relative',
    height: MEDIA_HEIGHT,
    backgroundColor: palette.gray[100],
    overflow: 'hidden',
  },
  carousel: {
    flex: 1,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  carouselButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(16, 24, 40, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  carouselButtonLeft: {
    left: 12,
  },
  carouselButtonRight: {
    right: 12,
  },
  dotsRow: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    zIndex: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  dotActive: {
    width: 18,
    backgroundColor: palette.white,
  },
  badgesOverlay: {
    ...StyleSheet.absoluteFill,
  },
  badgeLeft: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  badgeRight: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  badgeOrange: {
    backgroundColor: '#FEF0C7',
  },
  badgePink: {
    backgroundColor: '#FCE7F3',
  },
  badgeText: {
    fontSize: 12,
    lineHeight: 16,
    ...fontStyleForWeight('medium'),
  },
  badgeTextOrange: {
    color: '#B54708',
  },
  badgeTextPink: {
    color: '#C11574',
  },
  vibeBar: {
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vibeText: {
    fontSize: 13,
    lineHeight: 18,
    ...fontStyleForWeight('bold'),
    color: palette.white,
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 0,
    gap: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 20,
    lineHeight: 28,
    ...fontStyleForWeight('medium'),
    color: palette.black,
  },
  ratingPill: {
    backgroundColor: '#E0F2FE',
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  ratingText: {
    fontSize: 13,
    lineHeight: 18,
    ...fontStyleForWeight('bold'),
    color: palette.blue[600],
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  subtitle: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    ...fontStyleForWeight('medium'),
    color: palette.gray[700],
  },
  iconActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  roomTypesPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#E9EAEB',
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: '100%',
  },
  roomTypesText: {
    flexShrink: 1,
    fontSize: 13,
    lineHeight: 18,
    ...fontStyleForWeight('medium'),
    color: palette.black,
  },
  rentBlock: {
    gap: 2,
    marginTop: 2,
  },
  rentLabel: {
    fontSize: 12,
    lineHeight: 18,
    ...fontStyleForWeight('medium'),
    color: palette.gray[700],
  },
  rentValue: {
    fontSize: 24,
    lineHeight: 32,
    ...fontStyleForWeight('bold'),
    color: palette.black,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexBasis: 0,
    minHeight: 44,
    paddingHorizontal: 12,
  },
});
