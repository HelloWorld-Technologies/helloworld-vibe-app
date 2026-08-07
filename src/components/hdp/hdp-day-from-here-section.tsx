import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { HwSymbol } from '@/components/ui/hw-symbol';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import type { HdpDayCard } from '@/types/hdp-nearby';

const CARD_WIDTH = 220;
const CARD_GAP = 16;

type HdpDayFromHereSectionProps = {
  propertyName: string;
  mapUrl?: string;
  cards: HdpDayCard[];
};

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
  const imageSource = active?.imageUri ?? card.imageUri;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Typography variant="text" size="sm" weight="bold" color={palette.blue[700]}>
          {card.emoji} {card.category}
        </Typography>
      </View>

      {imageSource ? (
        <Image source={imageSource} style={styles.cardImage} contentFit="cover" />
      ) : (
        <View style={[styles.cardImage, styles.cardImagePlaceholder]} />
      )}

      <Typography variant="text" size="md" weight="bold" style={styles.placeName}>
        {active?.placeName ?? card.placeName}
      </Typography>
      <Typography variant="text" size="sm" weight="medium" color={palette.blue[500]}>
        {active?.walkTime ?? card.walkTime}
      </Typography>

      <Pressable onPress={onPressLink} accessibilityRole="button" style={styles.cardLink}>
        <Typography variant="text" size="sm" weight="bold" color={palette.lime[600]}>
          {card.linkLabel}
        </Typography>
        <HwSymbol name="chevron.right" size={12} weight="semibold" tintColor={palette.lime[600]} />
      </Pressable>
    </View>
  );
}

export function HdpDayFromHereSection({ propertyName, mapUrl, cards }: HdpDayFromHereSectionProps) {
  const [selectedByCard, setSelectedByCard] = useState<Record<string, number>>({});

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
    if (card.options.length <= 1) {
      if (mapUrl) void Linking.openURL(mapUrl);
      return;
    }

    Alert.alert(
      card.linkLabel,
      'Choose a nearby place',
      [
        ...card.options.map((option, index) => ({
          text: `${option.placeName} · ${option.walkTime}`,
          onPress: () => {
            setSelectedByCard((current) => ({ ...current, [card.id]: index }));
          },
        })),
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true },
    );
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
    height: 88,
    borderRadius: Radius.sm,
  },
  cardImagePlaceholder: {
    backgroundColor: palette.blue[50],
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
});
