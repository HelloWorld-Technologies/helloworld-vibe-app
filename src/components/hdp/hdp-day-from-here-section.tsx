import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import { Linking, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { HwSymbol } from '@/components/ui/hw-symbol';
import { Typography } from '@/components/ui/typography';
import { ImageAssets } from '@/constants/assets';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import type { HdpDayCard } from '@/types/hdp-nearby';

const CARD_WIDTH = 220;
const CARD_GAP = 16;
/** Temporarily hide until map deep-link UX is ready. */
const SHOW_ON_MAPS = false;

type HdpDayFromHereSectionProps = {
  propertyName: string;
  mapUrl?: string;
  cards: HdpDayCard[];
};

function resolveCardImageSource(imageUri?: string | number) {
  if (typeof imageUri === 'number') return imageUri;
  if (typeof imageUri === 'string' && imageUri.trim().length > 0) {
    return { uri: imageUri.trim() };
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

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Typography variant="text" size="sm" weight="bold" color={palette.blue[700]}>
          {card.emoji} {card.category}
        </Typography>
      </View>

      <Image
        key={String(imageUri ?? 'coming-soon')}
        source={imageSource}
        style={styles.cardImage}
        contentFit="cover"
        onError={() => {
          if (typeof imageUri === 'string') setFailedUri(imageUri);
        }}
      />

      <Typography variant="text" size="md" weight="bold" style={styles.placeName}>
        {active?.placeName ?? card.placeName}
      </Typography>
      <Typography variant="text" size="sm" weight="medium" color={palette.blue[500]}>
        {active?.walkTime ?? card.walkTime}
      </Typography>

      {card.options.length > 1 ? (
        <Pressable onPress={onPressLink} accessibilityRole="button" style={styles.cardLink}>
          <Typography variant="text" size="sm" weight="bold" color={palette.lime[600]}>
            {card.linkLabel}
          </Typography>
          <HwSymbol name="chevron.right" size={12} weight="semibold" tintColor={palette.lime[600]} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function HdpDayFromHereSection({ propertyName, mapUrl, cards }: HdpDayFromHereSectionProps) {
  const [selectedByCard, setSelectedByCard] = useState<Record<string, number>>({});
  const [pickerCard, setPickerCard] = useState<HdpDayCard | null>(null);

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
        {SHOW_ON_MAPS && mapUrl ? (
          <Pressable
            onPress={handleShowOnMaps}
            style={styles.mapLink}
            accessibilityRole="link"
            accessibilityLabel="Show on Maps">
            <HwSymbol name="mappin.and.ellipse" size={14} weight="medium" tintColor={palette.lime[600]} />
            <Typography variant="text" size="sm" weight="bold" color={palette.lime[600]}>
              Show on Maps
            </Typography>
          </Pressable>
        ) : null}
      </View>

      <Typography variant="text" size="sm" color={palette.gray[600]}>
        {subtitle}
      </Typography>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {cards.map((card, index) => (
          <View key={card.id} style={styles.column}>
            <View style={styles.timelineCell}>
              {index > 0 ? <View style={styles.timelineLineLeft} /> : null}
              <View style={styles.timelineDot} />
              {index < cards.length - 1 ? <View style={styles.timelineLineRight} /> : null}
            </View>

            <DayCard
              card={card}
              selectedIndex={getSelectedIndex(card)}
              onPressLink={() => handleCardLinkPress(card)}
            />
          </View>
        ))}
      </ScrollView>

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
                      size="sm"
                      weight="medium"
                      color={palette.blue[600]}
                      style={styles.pickerDistance}>
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
    paddingTop: 4,
    paddingBottom: 4,
    gap: CARD_GAP,
  },
  column: {
    width: CARD_WIDTH,
    gap: 10,
  },
  timelineCell: {
    height: 12,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: palette.blue[700],
    borderWidth: 2,
    borderColor: palette.white,
    zIndex: 1,
  },
  timelineLineLeft: {
    position: 'absolute',
    left: -CARD_GAP,
    width: CARD_GAP,
    top: 5,
    height: 2,
    backgroundColor: palette.blue[700],
  },
  timelineLineRight: {
    position: 'absolute',
    left: 5,
    right: -CARD_GAP,
    top: 5,
    height: 2,
    backgroundColor: palette.blue[700],
  },
  card: {
    width: CARD_WIDTH,
    borderWidth: 1,
    borderColor: palette.blue[200],
    borderRadius: Radius.md,
    padding: 12,
    gap: 8,
    backgroundColor: palette.white,
  },
  cardHeader: {
    minHeight: 20,
  },
  cardImage: {
    width: '100%',
    height: 120,
    borderRadius: Radius.sm,
  },
  placeName: {
    color: palette.gray[900],
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
