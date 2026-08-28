import { LinearGradient } from 'expo-linear-gradient'
import { useEffect, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import Svg, {
  Circle,
  Defs,
  Stop,
  LinearGradient as SvgLinearGradient
} from 'react-native-svg'

import { GradientText } from '@/components/ui/gradient-text'
import { AccordionChevron } from '@/components/ui/animated-accordion'
import { Typography } from '@/components/ui/typography'
import palette from '@/constants/palette'
import { Radius } from '@/constants/theme'
import { PROPERTY_VIBE_OPTIONS, type PropertyVibeOption } from '@/constants/vibes'

type VibeMatchItem = {
  id: string
  label: string
  emoji: string
  percent: number
}

type PropertyVibeItem = {
  id: string
  label: string
  emoji: string
}

type HdpVibeMatchCardProps = {
  matchPercent?: number
  propertyName?: string
  selectedVibeCount?: number
  vibeMatches?: VibeMatchItem[]
  propertyVibes?: readonly PropertyVibeItem[]
  workplaces?: string[]
  colleges?: string[]
  extraCount?: number
}

const DEFAULT_VIBE_MATCHES: VibeMatchItem[] = [
  { id: 'chill', label: 'Chill', emoji: '😎', percent: 87 },
  { id: 'night-owl', label: 'Night Owl', emoji: '🌙', percent: 97 },
  { id: 'gaming', label: 'Gamers', emoji: '🎮', percent: 78 },
  { id: 'creative', label: 'Creative', emoji: '🎨', percent: 84 }
]

// Will use in future — Residents work at / From colleges like
// const DEFAULT_WORKPLACES = ['Google', 'Microsoft', 'Amazon', 'Swiggy']
// const DEFAULT_COLLEGES = ['IIT Bombay', 'BITS Pilani', 'NIT Trichy']

const RING_GRADIENT = [palette.blue[400], palette.purpleScale[600]] as const

const SCORE_RING_GRADIENT = [
  palette.blue[400],
  palette.purpleScale[500],
  palette.purpleScale[600],
] as const

const SCORE_RING_TEXT_GRADIENT = [palette.blue[500], palette.purpleScale[600]] as const

function MatchScoreRing ({
  percent,
  size = 72
}: {
  percent: number
  size?: number
}) {
  const strokeWidth = 4
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(Math.max(percent, 0), 100) / 100
  const dashOffset = circumference * (1 - progress)
  const center = size / 2

  return (
    <View style={[styles.ringWrap, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Defs>
          <SvgLinearGradient
            id='vibeScoreRing'
            x1={center * 0.15}
            y1={size}
            x2={center * 1.85}
            y2={0}
            gradientUnits='userSpaceOnUse'
          >
            <Stop offset='0' stopColor={SCORE_RING_GRADIENT[0]} />
            <Stop offset='0.55' stopColor={SCORE_RING_GRADIENT[1]} />
            <Stop offset='1' stopColor={SCORE_RING_GRADIENT[2]} />
          </SvgLinearGradient>
        </Defs>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={palette.white}
          strokeWidth={strokeWidth}
          fill='none'
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke='url(#vibeScoreRing)'
          strokeWidth={strokeWidth}
          fill='none'
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap='round'
          rotation='60'
          origin={`${center}, ${center}`}
        />
      </Svg>
      <View style={styles.ringLabel}>
        <GradientText
          variant='text'
          size='sm'
          weight='bold'
          colors={SCORE_RING_TEXT_GRADIENT}
          style={styles.ringPercent}
        >
          {`${Math.round(percent)}%`}
        </GradientText>
      </View>
    </View>
  )
}

function VibeMatchTile ({ item }: { item: VibeMatchItem }) {
  return (
    <View style={styles.vibeTile}>
      <Typography variant='text' size='lg' style={styles.vibeEmoji}>
        {item.emoji}
      </Typography>
      <Typography
        variant='text'
        size='xs'
        weight='medium'
        color={palette.gray[800]}
      >
        {item.label}
      </Typography>
      <GradientText
        variant='text'
        size='xl'
        weight='bold'
        colors={RING_GRADIENT}
      >
        {`${item.percent}%`}
      </GradientText>
      <Typography variant='text' size='xs' color={palette.gray[400]}>
        Match
      </Typography>
    </View>
  )
}

function PropertyVibeChip ({ label, emoji }: { label: string; emoji: string }) {
  return (
    <View style={styles.propertyVibeChip}>
      <Typography variant='text' size='xs' style={styles.propertyVibeEmoji}>
        {emoji}
      </Typography>
      <Typography variant='text' size='xs' weight='medium' color={palette.gray[800]}>
        {label}
      </Typography>
    </View>
  )
}

function AnimatedPropertyVibes ({
  vibes,
  expanded,
}: {
  vibes: readonly PropertyVibeItem[]
  expanded: boolean
}) {
  const expandProgress = useSharedValue(expanded ? 1 : 0)
  const contentHeight = useSharedValue(0)

  useEffect(() => {
    expandProgress.value = withTiming(expanded ? 1 : 0, {
      duration: 280,
      easing: Easing.out(Easing.cubic),
    })
  }, [expandProgress, expanded])

  const containerStyle = useAnimatedStyle(() => ({
    height: contentHeight.value > 0 ? contentHeight.value * expandProgress.value : 0,
    opacity: interpolate(expandProgress.value, [0, 0.45, 1], [0, 1, 1]),
    overflow: 'hidden',
  }))

  return (
    <Animated.View style={[styles.propertyVibeContainer, containerStyle]}>
      <View
        style={styles.propertyVibeList}
        onLayout={(event) => {
          const nextHeight = event.nativeEvent.layout.height
          if (nextHeight > 0 && Math.abs(contentHeight.value - nextHeight) > 1) {
            contentHeight.value = nextHeight
          }
        }}>
        {vibes.map((vibe) => (
          <View key={vibe.id} style={styles.propertyVibeChipWrap}>
            <PropertyVibeChip label={vibe.label} emoji={vibe.emoji} />
          </View>
        ))}
      </View>
    </Animated.View>
  )
}

/* Will use in future — Residents work at / From colleges like
function ResidentInfoCard ({
  icon,
  title,
  items,
  extraCount
}: {
  icon: string
  title: string
  items: string[]
  extraCount: number
}) {
  return (
    <View style={styles.residentCard}>
      <Typography variant='text' size='xs' color={palette.gray[500]}>
        {icon} {title}
      </Typography>
      <View style={styles.residentRow}>
        <Typography
          variant='text'
          size='sm'
          weight='semibold'
          color={palette.gray[900]}
          style={styles.residentText}
        >
          {items.join(' • ')}
        </Typography>
        <View style={styles.extraBadge}>
          <Typography
            variant='text'
            size='xs'
            weight='bold'
            color={palette.gray[800]}
          >
            +{extraCount}
          </Typography>
        </View>
      </View>
    </View>
  )
}
*/

export function HdpVibeMatchCard ({
  matchPercent,
  propertyName = 'this property',
  selectedVibeCount,
  vibeMatches = DEFAULT_VIBE_MATCHES,
  propertyVibes = PROPERTY_VIBE_OPTIONS,
  // workplaces = DEFAULT_WORKPLACES,
  // colleges = DEFAULT_COLLEGES,
  // extraCount = 31
}: HdpVibeMatchCardProps) {
  const [showPropertyVibes, setShowPropertyVibes] = useState(true)
  const resolvedSelectedCount = selectedVibeCount ?? vibeMatches.length
  const score =
    matchPercent != null && Number.isFinite(matchPercent) && matchPercent > 0
      ? Math.round(matchPercent)
      : undefined
  const visibleMatches = vibeMatches.filter(item => item.percent > 0)

  return (
    <LinearGradient
      colors={[palette.vibeMatchCardGradientStart, palette.vibeMatchCardGradientEnd]}
      start={{ x: 0, y: 1 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Typography
            variant='text'
            size='xl'
            weight='medium'
            color={palette.gray[900]}
          >
            How well this home matches your vibe
          </Typography>
          <Typography variant='text' size='sm' color={palette.gray[600]}>
            {resolvedSelectedCount > 0
              ? `Based on the ${resolvedSelectedCount} vibe${resolvedSelectedCount === 1 ? '' : 's'} you selected`
              : 'Pick vibes on search to see your match score here'}
          </Typography>
        </View>
        {score != null ? <MatchScoreRing percent={score} /> : null}
      </View>

      {visibleMatches.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.vibeRow}
        >
          {visibleMatches.map(item => (
            <VibeMatchTile key={item.id} item={item} />
          ))}
        </ScrollView>
      ) : null}

      {/* Will use in future
      <View style={styles.residentList}>
        <ResidentInfoCard
          icon='🏢'
          title='Residents work at'
          items={workplaces}
          extraCount={extraCount}
        />
        <ResidentInfoCard
          icon='🎓'
          title='From colleges like'
          items={colleges}
          extraCount={extraCount}
        />
      </View>
      */}

      <AnimatedPropertyVibes vibes={propertyVibes} expanded={showPropertyVibes} />

      <View style={styles.footer}>
        <Typography
          variant='text'
          size='sm'
          weight='medium'
          style={styles.footerText}
        >
          See what residents at {propertyName} are usually into
        </Typography>
        <Pressable
          onPress={() => setShowPropertyVibes(current => !current)}
          style={({ pressed }) => [
            styles.showMore,
            pressed && styles.showMorePressed
          ]}
          accessibilityRole='button'
          accessibilityLabel={
            showPropertyVibes ? 'Hide property vibes' : 'Show property vibes'
          }
          accessibilityState={{ expanded: showPropertyVibes }}
        >
          <Typography
            variant='text'
            size='sm'
            color={palette.blue[600]}
          >
            {showPropertyVibes ? 'Show Less' : 'Show More'}
          </Typography>
          <AccordionChevron expanded={showPropertyVibes} color={palette.blue[600]} />
        </Pressable>
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.gray[200],
    padding: 16,
    gap: 16,
    overflow: 'hidden'
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12
  },
  headerCopy: {
    flex: 1,
    gap: 4,
    paddingRight: 8
  },
  ringWrap: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  ringLabel: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center'
  },
  ringPercent: {
    fontSize: 17,
    lineHeight: 18,
    letterSpacing: -0.2
  },
  vibeRow: {
    gap: 10,
    paddingRight: 4
  },
  vibeTile: {
    width: 96,
    minHeight: 118,
    borderRadius: Radius.md,
    backgroundColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 12,
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#EDE8F5'
  },
  vibeEmoji: {
    fontSize: 22,
    lineHeight: 28
  },
  residentList: {
    gap: 10
  },
  propertyVibeContainer: {
    position: 'relative',
  },
  propertyVibeList: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    alignContent: 'flex-start',
    justifyContent: 'flex-start',
    gap: 6,
  },
  propertyVibeChipWrap: {
    alignSelf: 'flex-start',
  },
  propertyVibeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: palette.white,
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.gray[200],
  },
  propertyVibeEmoji: {
    fontSize: 12,
    lineHeight: 14,
  },
  residentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8
  },
  residentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  residentText: {
    flex: 1,
    lineHeight: 20
  },
  extraBadge: {
    minWidth: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12
  },
  footerText: {
    flex: 1,
    lineHeight: 20
  },
  showMore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0
  },
  showMorePressed: {
    opacity: 0.85
  }
})
