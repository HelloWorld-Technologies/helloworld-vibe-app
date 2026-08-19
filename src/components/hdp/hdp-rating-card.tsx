import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { StyleSheet, View } from 'react-native'

import { Typography } from '@/components/ui/typography'
import { ImageAssets } from '@/constants/assets'
import palette from '@/constants/palette'
import { Radius } from '@/constants/theme'

type HdpRatingCardProps = {
  propertyName: string
  locality: string
  rating: number | null
  visitsScheduled: number
  reviewCount: number
  trending?: boolean
  topChoiceDate?: string
}

function StatColumn ({
  value,
  label,
  star
}: {
  value: string
  label: string
  star?: boolean
}) {
  return (
    <View style={styles.statCol}>
      <Typography
        variant='text'
        size='xl'
        weight='bold'
        color={palette.gray[900]}
        style={styles.statText}
      >
        {value}
      </Typography>
      <View style={styles.statLabelRow}>
        {star ? (
          <Typography variant='text' size='xs' color={palette.yellow[900]}>
            ★{' '}
          </Typography>
        ) : null}
        <Typography
          variant='text'
          size='xs'
          weight='medium'
          color={palette.gray[400]}
          style={styles.statText}
        >
          {label}
        </Typography>
      </View>
    </View>
  )
}

export function HdpRatingCard ({
  propertyName,
  locality,
  rating,
  visitsScheduled,
  reviewCount,
  trending = false,
  topChoiceDate
}: HdpRatingCardProps) {
  return (
    <LinearGradient
      colors={[
        'rgba(255,255,255,0.92)',
        'rgba(255,255,255,0.92)',
        'rgba(213,236,249,0.56)',
        'rgba(213,236,249,0.56)'
      ]}
      start={{ x: 0, y: 1 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.top}>
        {trending ? (
          <View style={styles.trendingBadge}>
            <Typography
              variant='text'
              size='xs'
              weight='medium'
              color={palette.lime[800]}
            >
              ↗ Trending
            </Typography>
          </View>
        ) : null}
        <Typography
          variant='text'
          size='xl'
          weight='bold'
          color={palette.gray[800]}
        >
          {propertyName}
        </Typography>
        <Typography
          variant='text'
          size='lg'
          weight='medium'
          color={palette.gray[800]}
        >
          is the top choice in {locality}.
        </Typography>
        {topChoiceDate ? (
          <Typography variant='text' size='sm' color={palette.gray[500]}>
            {topChoiceDate}
          </Typography>
        ) : null}
      </View>

      <View style={styles.divider} />

      <View style={styles.statsRow}>
        <View style={styles.statsGroup}>
          <StatColumn
            value={rating != null && Number.isFinite(rating) ? rating.toFixed(1) : '—'}
            label='Rating'
            star
          />
          <View style={styles.statDivider} />
          <StatColumn value={String(visitsScheduled)} label='Visits scheduled' />
          <View style={styles.statDivider} />
          <StatColumn value={String(reviewCount)} label='Reviews' />
        </View>
        <Image
          source={ImageAssets.hdpTrophy}
          style={styles.trophy}
          contentFit='contain'
        />
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: palette.gray[300],
    padding: 16,
    overflow: 'hidden'
  },
  top: {
    gap: 8,
  },
  trendingBadge: {
    alignSelf: 'flex-start',
    backgroundColor: palette.lime[50],
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 2
  },
  divider: {
    height: 1,
    backgroundColor: palette.gray[300],
    marginVertical: 16
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statsGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  statText: {
    textAlign: 'center',
  },
  statLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statDivider: {
    width: 1,
    height: 31,
    backgroundColor: palette.gray[300],
  },
  trophy: {
    width: 56,
    height: 56,
    flexShrink: 0,
  },
})
