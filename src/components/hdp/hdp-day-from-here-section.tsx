import { CarouselPagination } from '@/components/ui/carousel/carousel-pagination';
import { HwSymbol } from '@/components/ui/hw-symbol';
import { Typography } from '@/components/ui/typography';
import { HdpIcons, ImageAssets } from '@/constants/assets';
import { Fonts, fontStyleForWeight } from '@/constants/fonts';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import type { HdpDayCard } from '@/types/hdp-nearby';
import { Image } from 'expo-image';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';

const MapPinIcon = HdpIcons.mapPin;
const SECTION_ACCENT = palette.lime[700];

const CARD_WIDTH = 220;
const CARD_GAP = 16;
const SLIDE_WIDTH = CARD_WIDTH + CARD_GAP;
const TIMELINE_HEIGHT = 24;
const TIMELINE_DOT_CORE = 14;
const TIMELINE_DOT_WHITE_SPREAD = 2.5;
const TIMELINE_DOT_SIZE = TIMELINE_DOT_CORE + TIMELINE_DOT_WHITE_SPREAD * 2;

type HdpDayFromHereSectionProps = {
  propertyName: string;
  mapUrl?: string;
  cards: HdpDayCard[];
};

function TimelineDot() {
  return (
    <View style={styles.timelineDotWhite}>
      <View style={styles.timelineDotCore} />
    </View>
  );
}

function resolveCardImageSource(imageUri?: string | number) {
  if (typeof imageUri === 'string' && imageUri.trim().length > 0) {
    const uri = imageUri.trim();
    if (uri.includes('coming-soon')) return ImageAssets.comingSoon;
    return { uri };
  }
  return ImageAssets.comingSoon;
}

function DayCard({
  card,
  selectedIndex,
  onPressLink,
}: {
  card: HdpDayCard;
  selectedIndex: number;
  onPressLink: () => void;
}) {
  const active = card.options[selectedIndex] ?? card.options[0];
  const imageUri = active?.imageUri ?? card.imageUri;
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const imageSource =
    typeof imageUri === 'string' && failedUri === imageUri
      ? ImageAssets.comingSoon
      : resolveCardImageSource(imageUri);
  const isComingSoon =
    imageSource === ImageAssets.comingSoon ||
    (typeof imageUri === 'string' && imageUri.includes('coming-soon'));

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Typography variant="text" size="sm" weight="bold" color={palette.blue[700]}>
          {card.emoji} {card.category}
        </Typography>
      </View>

      <View style={[styles.cardImageWrap, isComingSoon && styles.cardImageComingSoon]}>
        <Image
          key={String(imageUri ?? 'coming-soon')}
          source={imageSource}
          style={styles.cardImage}
          contentFit={isComingSoon ? 'contain' : 'cover'}
          cachePolicy="memory-disk"
          onError={() => {
            if (typeof imageUri === 'string' && !imageUri.includes('coming-soon')) {
              setFailedUri(imageUri);
            }
          }}
        />
      </View>

      <Typography variant="text" size="md" weight="medium" style={styles.placeName}>
        {active?.placeName ?? card.placeName}
      </Typography>
      <Typography
        variant="text"
        size="xs"
        weight="medium"
        color={palette.blue[800]}
        style={styles.walkTime}>
        {active?.walkTime ?? card.walkTime}
      </Typography>

      {card.options.length > 1 ? (
        <Pressable onPress={onPressLink} accessibilityRole="button" style={styles.cardLink}>
          <Typography variant="text" size="sm" weight="bold" color={SECTION_ACCENT}>
            {card.linkLabel}
          </Typography>
          <HwSymbol name="chevron.right" size={12} weight="semibold" tintColor={SECTION_ACCENT} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function HdpDayFromHereSection({ propertyName, mapUrl, cards }: HdpDayFromHereSectionProps) {
  const scrollRef = useRef<Animated.ScrollView>(null);
  const progress = useSharedValue(0);
  const [selectedByCard, setSelectedByCard] = useState<Record<string, number>>({});
  const [pickerCard, setPickerCard] = useState<HdpDayCard | null>(null);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      progress.value = event.contentOffset.x / SLIDE_WIDTH;
    },
  });

  const handlePaginationPress = useCallback((index: number) => {
    scrollRef.current?.scrollTo({ x: index * SLIDE_WIDTH, animated: true });
  }, []);

  const subtitle = useMemo(
    () => `What living at ${propertyName} actually looks like.`,
    [propertyName],
  );

  if (cards.length === 0) {
    return null;
  }

  function handleShowOnMaps() {
    if (!mapUrl) return;
    void Linking.openURL(mapUrl);
  }

  function getSelectedIndex(card: HdpDayCard) {
    return selectedByCard[card.id] ?? 0;
  }

  function handleCardLinkPress(card: HdpDayCard) {
    if (card.options.length <= 1) return;
    setPickerCard(card);
  }

  function handleSelectPlace(index: number) {
    if (!pickerCard) return;
    setSelectedByCard((current) => ({ ...current, [pickerCard.id]: index }));
    setPickerCard(null);
  }

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Typography variant="text" size="xl" weight="bold">
          A Day from here
        </Typography>
        {mapUrl ? (
          <Pressable
            onPress={handleShowOnMaps}
            style={styles.mapLink}
            accessibilityRole="link"
            accessibilityLabel="Show on Maps">
            <MapPinIcon width={13} height={14} />
            <Typography variant="text" size="sm" weight="bold" color={SECTION_ACCENT}>
              Show on Maps
            </Typography>
          </Pressable>
        ) : null}
      </View>

      <Typography variant="text" size="sm" color={palette.gray[600]}>
        {subtitle}
      </Typography>

      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={SLIDE_WIDTH}
        snapToAlignment="start"
        disableIntervalMomentum>
        {cards.map((card, index) => (
          <View key={card.id} style={styles.column}>
            <View style={styles.timelineCell}>
              <TimelineDot />
              {index < cards.length - 1 ? (
                <View
                  style={[
                    styles.timelineLine,
                    { width: CARD_WIDTH + CARD_GAP - TIMELINE_DOT_SIZE / 2 },
                  ]}
                />
              ) : null}
            </View>

            <DayCard
              card={card}
              selectedIndex={getSelectedIndex(card)}
              onPressLink={() => handleCardLinkPress(card)}
            />
          </View>
        ))}
      </Animated.ScrollView>

      {cards.length > 1 ? (
        <CarouselPagination
          progress={progress}
          data={cards}
          onPress={handlePaginationPress}
          containerStyle={styles.pagination}
        />
      ) : null}

      <Modal
        transparent
        visible={pickerCard != null}
        animationType="fade"
        onRequestClose={() => setPickerCard(null)}>
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setPickerCard(null)} />
          <View style={styles.pickerCard}>
            <View style={styles.pickerHeader}>
              <Typography variant="text" size="md" weight="bold">
                {pickerCard?.linkLabel}
              </Typography>
              <Typography variant="text" size="sm" color={palette.gray[600]}>
                Choose a nearby place
              </Typography>
            </View>

            <ScrollView
              bounces={false}
              style={styles.pickerList}
              contentContainerStyle={styles.pickerListContent}>
              {pickerCard?.options.map((option, index) => {
                const selected = getSelectedIndex(pickerCard) === index;
                return (
                  <Pressable
                    key={option.id}
                    onPress={() => handleSelectPlace(index)}
                    style={[styles.pickerRow, selected && styles.pickerRowSelected]}
                    accessibilityRole="button">
                    <Typography
                      variant="text"
                      size="sm"
                      weight="medium"
                      style={styles.pickerName}
                      numberOfLines={2}>
                      {option.placeName}
                    </Typography>
                    <Typography
                      variant="text"
                      size="xs"
                      weight="medium"
                      color={palette.blue[800]}
                      style={[styles.walkTime, styles.pickerDistance]}>
                      {option.walkTime}
                    </Typography>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Pressable
              onPress={() => setPickerCard(null)}
              style={styles.pickerCancel}
              accessibilityRole="button">
              <Typography variant="text" size="sm" weight="bold" color={palette.gray[700]}>
                Cancel
              </Typography>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  mapLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 4,
    gap: CARD_GAP,
  },
  pagination: {
    marginTop: 8,
  },
  column: {
    width: CARD_WIDTH,
    gap: 10,
    overflow: 'visible',
  },
  timelineCell: {
    height: TIMELINE_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'visible',
  },
  timelineDotWhite: {
    width: TIMELINE_DOT_SIZE,
    height: TIMELINE_DOT_SIZE,
    borderRadius: TIMELINE_DOT_SIZE / 2,
    backgroundColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  timelineDotCore: {
    width: TIMELINE_DOT_CORE,
    height: TIMELINE_DOT_CORE,
    borderRadius: TIMELINE_DOT_CORE / 2,
    backgroundColor: palette.blue[800],
  },
  timelineLine: {
    position: 'absolute',
    left: TIMELINE_DOT_SIZE / 2,
    top: TIMELINE_HEIGHT / 2 - 1,
    height: 2,
    backgroundColor: palette.blue[800],
    zIndex: 0,
  },
  card: {
    width: CARD_WIDTH,
    borderWidth: 0.5,
    borderColor: palette.blue[300],
    borderRadius: Radius.md,
    padding: 8,
    gap: 8,
    backgroundColor: palette.blue[50],
  },
  cardHeader: {
    minHeight: 20,
  },
  cardTitle: Platform.select({
    ios: { fontFamily: Fonts.bold, fontWeight: 'normal' as const },
    default: fontStyleForWeight('bold'),
  }),
  cardImageWrap: {
    width: '100%',
    height: 120,
    borderRadius: Radius.sm,
    overflow: 'hidden',
    backgroundColor: palette.gray[100],
  },
  cardImageComingSoon: {
    backgroundColor: palette.white,
    padding: 10,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  placeName: {
    color: palette.gray[900],
  },
  walkTime: {
    lineHeight: 15,
  },
  cardLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(16, 24, 40, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  pickerCard: {
    width: '100%',
    maxWidth: 360,
    maxHeight: '70%',
    backgroundColor: palette.white,
    borderRadius: 20,
    overflow: 'hidden',
    paddingTop: 20,
  },
  pickerHeader: {
    paddingHorizontal: 20,
    gap: 4,
    paddingBottom: 12,
  },
  pickerList: {
    flexGrow: 0,
  },
  pickerListContent: {
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: Radius.md,
  },
  pickerRowSelected: {
    backgroundColor: palette.lime[50],
  },
  pickerName: {
    flex: 1,
    color: palette.gray[900],
  },
  pickerDistance: {
    flexShrink: 0,
    textAlign: 'right',
  },
  pickerCancel: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.gray[200],
  },
});
