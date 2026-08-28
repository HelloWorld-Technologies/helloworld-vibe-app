import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HwSymbol } from '@/components/ui/hw-symbol';
import { HwIcon } from '@/components/hw-icon';
import { AccordionChevron } from '@/components/ui/animated-accordion';
import { LocalityCardImage } from '@/components/locality/locality-card-image';
import { PropertyCard } from '@/components/property/property-card';
import { TabBarIcon } from '@/components/tab-bar-icon';
import { VibeSelectionList } from '@/components/vibe/vibe-selection-list';
import { HwCarousel, HwParallaxCarousel, ParallaxLayer } from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { Collapsible } from '@/components/ui/collapsible';
import { GradientText } from '@/components/ui/gradient-text';
import { OtpInput } from '@/components/ui/otp-input';
import { SearchInput } from '@/components/ui/search-input';
import { TextArea } from '@/components/ui/text-area';
import { TextField } from '@/components/ui/text-field';
import {
  Body,
  Caption,
  Heading,
  Label,
  Title,
  Typography,
} from '@/components/ui/typography';
import { TypeScale, FONT_WEIGHTS } from '@/constants/fonts';
import { HOME_BACKGROUND_GRADIENT, NEIGHBORHOODS } from '@/constants/home';
import { SAMPLE_PROPERTIES, SAMPLE_PROPERTY } from '@/constants/sample-property';
import palette, { COLOR_SCALES, COLOR_WEIGHTS, type ColorScaleName } from '@/constants/palette';
import { VIBE_OPTIONS } from '@/constants/vibes';
import { Radius } from '@/constants/theme';
import type { TabBarIconName } from '@/constants/tab-bar';

function Section({ title, children }: { title: string; children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.section}>
      <Pressable
        onPress={() => setIsOpen((open) => !open)}
        style={({ pressed }) => [styles.sectionHeader, pressed && styles.sectionHeaderPressed]}
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        accessibilityLabel={title}>
        <Typography variant="text" size="lg" weight="bold" style={styles.sectionTitle}>
          {title}
        </Typography>
        <AccordionChevron expanded={isOpen} />
      </Pressable>
      {isOpen ? (
        <Animated.View entering={FadeIn.duration(200)} style={styles.sectionBody}>
          {children}
        </Animated.View>
      ) : null}
    </View>
  );
}

function Subsection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.subsection}>
      <Caption style={styles.subsectionLabel}>{label}</Caption>
      {children}
    </View>
  );
}

function TypeRow({ meta, children }: { meta: string; children: ReactNode }) {
  return (
    <View style={styles.typeRow}>
      <Caption style={styles.typeMeta}>{meta}</Caption>
      {children}
    </View>
  );
}

const DISPLAY_SIZES = Object.keys(TypeScale.display) as (keyof typeof TypeScale.display)[];
const TEXT_SIZES = Object.keys(TypeScale.text) as (keyof typeof TypeScale.text)[];

const LEGACY_VARIANTS = [
  { variant: 'title' as const, label: 'title', mapsTo: 'display / lg / bold' },
  { variant: 'heading' as const, label: 'heading', mapsTo: 'text / xl / bold' },
  { variant: 'body' as const, label: 'body', mapsTo: 'text / md / regular' },
  { variant: 'caption' as const, label: 'caption', mapsTo: 'text / sm / regular' },
  { variant: 'label' as const, label: 'label', mapsTo: 'text / sm / medium' },
];

function formatScaleMeta(variant: 'display' | 'text', size: string) {
  const scale = variant === 'display' ? TypeScale.display : TypeScale.text;
  const token = scale[size as keyof typeof scale];
  const spacing =
    'letterSpacing' in token && token.letterSpacing !== undefined
      ? ` · ${token.letterSpacing}px ls`
      : '';
  return `${token.fontSize}/${token.lineHeight}${spacing}`;
}

const COLOR_SWATCHES = [
  { name: 'textPrimary', color: palette.textPrimary },
  { name: 'textSecondary', color: palette.textSecondary },
  { name: 'textLabel', color: palette.textLabel },
  { name: 'textPlaceholder', color: palette.textPlaceholder },
  { name: 'helloLime', color: palette.helloLime },
  { name: 'error', color: palette.error },
  { name: 'white', color: palette.white },
  { name: 'blue[600]', color: palette.blue[600] },
  { name: 'lime[300]', color: palette.lime[300] },
] as const;

function ColorSwatch({ name, color }: { name: string; color: string }) {
  const isLight = name.endsWith('25') || name.endsWith('50') || name.endsWith('100');

  return (
    <View style={styles.swatch}>
      <View style={[styles.swatchColor, { backgroundColor: color }]} />
      <Text style={[styles.swatchLabel, isLight && styles.swatchLabelDark]}>{name}</Text>
      <Text style={[styles.swatchHex, isLight && styles.swatchLabelDark]}>{color}</Text>
    </View>
  );
}

const SCALE_LABELS: Record<ColorScaleName, string> = {
  lime: 'Lime / Green',
  yellow: 'Yellow / Orange',
  gray: 'Gray / Neutral',
  red: 'Red',
  blue: 'Blue',
  purple: 'Purple',
};

const TAB_ICONS: TabBarIconName[] = ['home', 'myVisits', 'wishlist', 'contact'];
const SHOWCASE_ITEM_GAP = 12;
const SHOWCASE_PROPERTY_HEIGHT = 520;

export function ComponentShowcaseScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [otp, setOtp] = useState('123456');
  const [notes, setNotes] = useState('');
  const [selectedVibes, setSelectedVibes] = useState<string[]>(['creative']);

  const cardWidth = width - 72;
  const slideWidth = cardWidth + SHOWCASE_ITEM_GAP;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <HwSymbol name="chevron.left" size={18} weight="semibold" tintColor={palette.gray[800]} />
        </Pressable>
        <Typography variant="text" size="lg" weight="bold">
          Component Showcase
        </Typography>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <Section title="Typography — Legacy variants">
          <Subsection label="Shorthand components">
            <TypeRow meta="Title">
              <Title>Title — display lg bold</Title>
            </TypeRow>
            <TypeRow meta="Heading">
              <Heading>Heading — text xl bold</Heading>
            </TypeRow>
            <TypeRow meta="Body">
              <Body>Body — text md regular</Body>
            </TypeRow>
            <TypeRow meta="Caption">
              <Caption>Caption — text sm, textSecondary</Caption>
            </TypeRow>
            <TypeRow meta="Label">
              <Label>Label — text sm medium, textLabel</Label>
            </TypeRow>
          </Subsection>
          <Subsection label="variant prop">
            {LEGACY_VARIANTS.map(({ variant, label, mapsTo }) => (
              <TypeRow key={variant} meta={`variant="${label}" → ${mapsTo}`}>
                <Typography variant={variant}>
                  The quick brown fox jumps over the lazy dog.
                </Typography>
              </TypeRow>
            ))}
          </Subsection>
        </Section>

        <Section title="Typography — Display scale">
          {DISPLAY_SIZES.map((size) => (
            <Subsection key={size} label={`display / ${size} (${formatScaleMeta('display', size)})`}>
              {FONT_WEIGHTS.map((weight) => (
                <TypeRow key={weight} meta={weight}>
                  <Typography variant="display" size={size} weight={weight}>
                    Display {size} · {weight}
                  </Typography>
                </TypeRow>
              ))}
            </Subsection>
          ))}
        </Section>

        <Section title="Typography — Text scale">
          {TEXT_SIZES.map((size) => (
            <Subsection key={size} label={`text / ${size} (${formatScaleMeta('text', size)})`}>
              {FONT_WEIGHTS.map((weight) => (
                <TypeRow key={weight} meta={weight}>
                  <Typography variant="text" size={size} weight={weight}>
                    Text {size} · {weight} — The quick brown fox jumps over the lazy dog.
                  </Typography>
                </TypeRow>
              ))}
            </Subsection>
          ))}
        </Section>

        <Section title="Typography — Weights">
          <Subsection label="All weight tokens at text / md">
            {FONT_WEIGHTS.map((weight) => (
              <TypeRow key={weight} meta={weight}>
                <Typography variant="text" size="md" weight={weight}>
                  Satoshi {weight} — 0123456789
                </Typography>
              </TypeRow>
            ))}
          </Subsection>
        </Section>

        <Section title="Typography — Colors">
          <Subsection label="Semantic & brand colors at text / md">
            {COLOR_SWATCHES.map(({ name, color }) => (
              <View key={name} style={styles.colorTypeRow}>
                <View style={[styles.colorTypeDot, { backgroundColor: color }]} />
                {name === 'white' ? (
                  <View style={styles.colorTypeOnDark}>
                    <Typography variant="text" size="md" color={color}>
                      {name}
                    </Typography>
                  </View>
                ) : (
                  <Typography variant="text" size="md" color={color}>
                    {name}
                  </Typography>
                )}
              </View>
            ))}
          </Subsection>
        </Section>

        <Section title="Buttons">
          <Subsection label="Variants">
            <Button label="Primary" onPress={() => {}} />
            <Button label="Outline" variant="outline" onPress={() => {}} />
            <Button label="Text" variant="text" onPress={() => {}} />
          </Subsection>
          <Subsection label="States">
            <Button label="Loading" loading onPress={() => {}} />
            <Button label="Disabled" disabled onPress={() => {}} />
            <Button label="Disabled outline" variant="outline" disabled onPress={() => {}} />
          </Subsection>
        </Section>

        <Section title="Text field">
          <TextField label="Default" placeholder="Enter text" />
          <TextField label="With hint" placeholder="Enter text" hint="Helper text below the field." />
          <TextField
            label="With error"
            placeholder="Enter text"
            defaultValue="Invalid value"
            error="This field has an error."
          />
          <TextField label="Disabled" placeholder="Disabled" editable={false} value="Read only value" />
          <TextField
            label="With left icon"
            placeholder="Search"
            leftIcon={<HwSymbol name="magnifyingglass" size={18} tintColor={palette.gray[500]} />}
          />
        </Section>

        <Section title="Search input">
          <LinearGradient
            colors={[...HOME_BACKGROUND_GRADIENT.colors]}
            start={HOME_BACKGROUND_GRADIENT.start}
            end={HOME_BACKGROUND_GRADIENT.end}
            style={styles.searchInputPreview}>
            <SearchInput editable={false} />
          </LinearGradient>
        </Section>

        <Section title="Text area">
          <TextArea label="Default" placeholder="Write something…" value={notes} onChangeText={setNotes} />
          <TextArea label="With hint" placeholder="Message" hint="Max 500 characters." />
          <TextArea
            label="With error"
            placeholder="Message"
            defaultValue="Too short"
            error="Please enter at least 20 characters."
          />
          <TextArea label="Disabled" placeholder="Disabled" editable={false} value="Cannot edit this." />
        </Section>

        <Section title="OTP input">
          <Subsection label="Filled">
            <OtpInput value={otp} onChange={setOtp} />
          </Subsection>
          <Subsection label="Empty">
            <OtpInput value="" onChange={() => {}} />
          </Subsection>
        </Section>

        <Section title="Gradient text">
          <Subsection label="Section title highlight">
            <View style={styles.gradientTextRow}>
              <Typography variant="text" size="xl" weight="bold">
                Find your{' '}
              </Typography>
              <GradientText variant="text" size="xl" weight="bold" style={styles.gradientItalic}>
                Neighborhood!
              </GradientText>
            </View>
          </Subsection>
          <Subsection label="Custom colors">
            <GradientText
              variant="text"
              size="lg"
              weight="bold"
              colors={[palette.lime[400], palette.lightBlue]}>
              HelloWorld Vibe
            </GradientText>
          </Subsection>
        </Section>

        <Section title="Home background gradient">
          <LinearGradient
            colors={[...HOME_BACKGROUND_GRADIENT.colors]}
            start={HOME_BACKGROUND_GRADIENT.start}
            end={HOME_BACKGROUND_GRADIENT.end}
            style={styles.homeGradientPreview}>
            <Typography variant="text" size="sm" weight="bold" color={palette.white}>
              #252B37 → #3B4760
            </Typography>
            <Typography variant="text" size="xs" color={palette.gray[300]}>
              Vertical linear gradient (home sticky header + hero)
            </Typography>
          </LinearGradient>
          <View style={styles.swatchRow}>
            <ColorSwatch name="homeGradientTop" color={palette.homeGradientTop} />
            <ColorSwatch name="homeGradientBottom" color={palette.homeGradientBottom} />
          </View>
        </Section>

        <Section title="Vibe selection">
          <Subsection label="On dark (home header)">
            <LinearGradient
              colors={[...HOME_BACKGROUND_GRADIENT.colors]}
              start={HOME_BACKGROUND_GRADIENT.start}
              end={HOME_BACKGROUND_GRADIENT.end}
              style={styles.vibeDarkBg}>
              <VibeSelectionList
                vibes={VIBE_OPTIONS}
                selectedIds={selectedVibes}
                onChange={setSelectedVibes}
                variant="onDark"
                hint="✨ Pick at least 5 vibes for better matches (optional)"
              />
            </LinearGradient>
          </Subsection>
          <Subsection label="On light">
            <VibeSelectionList
              vibes={VIBE_OPTIONS}
              selectedIds={selectedVibes}
              onChange={setSelectedVibes}
              variant="onLight"
              scrollable={false}
            />
          </Subsection>
        </Section>

        <Section title="Collapsible (primitive)">
          <Collapsible title="Tap to expand nested collapsible">
            <Typography variant="text" size="sm" color={palette.textSecondary}>
              Collapsible content area. Use for FAQs, accordions, or nested details.
            </Typography>
          </Collapsible>
        </Section>

        <Section title="Icons">
          <Subsection label="Tab bar">
            <View style={styles.iconRow}>
              {TAB_ICONS.map((name) => (
                <View key={name} style={styles.iconCell}>
                  <TabBarIcon name={name} size={24} color={palette.gray[800]} />
                  <Caption>{name}</Caption>
                </View>
              ))}
            </View>
          </Subsection>
          <Subsection label="Brand / login">
            <View style={styles.iconRow}>
              {(['edit', 'whatsapp', 'call', 'bangalore'] as const).map((name) => (
                <View key={name} style={styles.iconCell}>
                  <HwIcon name={name} size={24} />
                  <Caption>{name}</Caption>
                </View>
              ))}
            </View>
          </Subsection>
        </Section>

        <Section title="Property card">
          <PropertyCard property={SAMPLE_PROPERTY} />
        </Section>

        <Section title="Carousels">
          <Subsection label="HwCarousel — property cards">
            <HwCarousel
              data={SAMPLE_PROPERTIES}
              width={slideWidth}
              height={SHOWCASE_PROPERTY_HEIGHT}
              style={styles.carouselWrap}
              renderItem={({ item }) => (
                <PropertyCard property={item} style={{ width: cardWidth, alignSelf: 'center' }} />
              )}
            />
          </Subsection>
          <Subsection label="HwParallaxCarousel — neighborhoods">
            <HwParallaxCarousel
              data={[...NEIGHBORHOODS]}
              width={slideWidth}
              height={160}
              style={styles.carouselWrap}
              renderItem={({ item, animationValue }) => (
                <View style={[styles.neighborhoodCard, { width: cardWidth }]}>
                  <ParallaxLayer animationValue={animationValue} style={styles.neighborhoodImageWrap}>
                    <LocalityCardImage imageKey={item.image} style={styles.neighborhoodImage} />
                  </ParallaxLayer>
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.75)']}
                    style={styles.neighborhoodOverlay}>
                    <Typography variant="text" size="sm" weight="bold" color={palette.white}>
                      {item.name}
                    </Typography>
                  </LinearGradient>
                </View>
              )}
            />
          </Subsection>
        </Section>

        <Section title="Brand palette">
          <Subsection label="Brand tokens">
            <View style={styles.swatchRow}>
              <ColorSwatch name="helloLime" color={palette.helloLime} />
              <ColorSwatch name="yellowWorld" color={palette.yellowWorld} />
              <ColorSwatch name="lightBlue" color={palette.lightBlue} />
              <ColorSwatch name="purple" color={palette.purple} />
              <ColorSwatch name="grey" color={palette.grey} />
              <ColorSwatch name="error" color={palette.error} />
            </View>
          </Subsection>

          {(Object.keys(COLOR_SCALES) as ColorScaleName[]).map((scaleName) => (
            <Subsection key={scaleName} label={SCALE_LABELS[scaleName]}>
              <View style={styles.swatchRow}>
                {COLOR_WEIGHTS.map((weight) => (
                  <ColorSwatch
                    key={weight}
                    name={`${weight}`}
                    color={COLOR_SCALES[scaleName][weight]}
                  />
                ))}
              </View>
            </Subsection>
          ))}
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.gray[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: palette.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.gray[200],
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
    gap: 28,
  },
  section: {
    backgroundColor: palette.white,
    borderRadius: Radius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: palette.gray[200],
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionHeaderPressed: {
    opacity: 0.75,
  },
  sectionTitle: {
    flex: 1,
  },
  sectionBody: {
    gap: 16,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.gray[200],
  },
  subsection: {
    gap: 10,
  },
  subsectionLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  typeRow: {
    gap: 2,
  },
  typeMeta: {
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  colorTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  colorTypeDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.gray[200],
  },
  colorTypeOnDark: {
    backgroundColor: palette.homeGradientTop,
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  vibeDarkBg: {
    borderRadius: Radius.md,
    padding: 16,
  },
  gradientTextRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
  },
  gradientItalic: {
    fontStyle: 'italic',
  },
  homeGradientPreview: {
    borderRadius: Radius.md,
    padding: 20,
    gap: 4,
    minHeight: 88,
    justifyContent: 'flex-end',
  },
  searchInputPreview: {
    borderRadius: Radius.md,
    padding: 20,
    paddingVertical: 24,
  },
  carouselWrap: {
    marginHorizontal: -4,
  },
  neighborhoodCard: {
    height: 160,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  neighborhoodImageWrap: {
    ...StyleSheet.absoluteFill,
  },
  neighborhoodImage: {
    width: '110%',
    height: '100%',
    marginLeft: '-5%',
  },
  neighborhoodOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
  },
  iconRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  iconCell: {
    alignItems: 'center',
    gap: 6,
    minWidth: 64,
  },
  swatchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  swatch: {
    alignItems: 'center',
    gap: 2,
    width: 64,
    marginBottom: 8,
  },
  swatchColor: {
    width: 44,
    height: 44,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: palette.gray[200],
  },
  swatchLabel: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '600',
    color: palette.textSecondary,
    textAlign: 'center',
  },
  swatchHex: {
    fontSize: 9,
    lineHeight: 12,
    color: palette.textSecondary,
    textAlign: 'center',
  },
  swatchLabelDark: {
    color: palette.gray[600],
  },
});
