import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { StyleSheet, useWindowDimensions, View } from 'react-native'

import { Typography } from '@/components/ui/typography'
import { ImageAssets } from '@/constants/assets'
import palette from '@/constants/palette'

const GAP = 8
const RADIUS = 8

type LoginBentoProps = {
  compact?: boolean
}

function LiveBetterCard ({ compact = false }: { compact?: boolean }) {
  return (
    <LinearGradient
      colors={[
        'rgba(83,197,94,0.89)',
        'rgba(17,168,218,0.89)',
        'rgba(144,61,192,0.89)'
      ]}
      start={{ x: 0, y: 1 }}
      end={{ x: 1, y: 0 }}
      style={compact ? styles.compactLiveBetter : styles.liveBetter}
    >
      <Image
        source={ImageAssets.loginLiveBetterText}
        style={compact ? styles.compactLiveBetterText : styles.liveBetterText}
        contentFit='contain'
      />
      <Image
        source={ImageAssets.loginHelloWorldWordmark}
        style={compact ? styles.compactWordmark : styles.wordmark}
        contentFit='contain'
      />
    </LinearGradient>
  )
}

export function LoginBento ({ compact = false }: LoginBentoProps) {
  const { width, height } = useWindowDimensions()
  const isTablet = Math.min(width, height) >= 600

  if (compact) {
    return (
      <View style={styles.compactRoot}>
        <LiveBetterCard compact />
        <View style={styles.compactRight}>
          <Image
            source={ImageAssets.loginBento2}
            style={styles.compactDining}
            contentFit='cover'
          />
          <View style={styles.compactColiving}>
            <LinearGradient
              colors={[
                'rgba(83,197,94,0.89)',
                'rgba(17,168,218,0.89)',
                'rgba(144,61,192,0.89)'
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <Typography
              variant='text'
              size={isTablet ? 'md' : 'sm'}
              weight='bold'
              color={palette.white}
            >
              250+
            </Typography>
            <Typography
              variant='text'
              size='xs'
              weight='medium'
              color={palette.white}
            >
              Coliving
            </Typography>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.root}>
      <View style={styles.left}>
        <Image
          source={ImageAssets.loginBento1}
          style={styles.hero}
          contentFit='cover'
        />
        <View style={styles.leftRow}>
          <LinearGradient
            colors={['#32ACDD', '#7474CF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.citiesTile}
          >
            <Typography
              variant='text'
              size={isTablet ? 'xl' : 'lg'}
              weight='bold'
              color={palette.white}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
            >
              16+
            </Typography>
            <Typography
              variant='text'
              size='xs'
              weight='medium'
              color={palette.white}
              numberOfLines={1}
            >
              Cities
            </Typography>
          </LinearGradient>
          <Image
            source={ImageAssets.loginBentoBedroomSmall}
            style={styles.bedroom}
            contentFit='cover'
          />
        </View>
        <LiveBetterCard />
      </View>

      <View style={styles.right}>
        <Image
          source={ImageAssets.loginBento2}
          style={styles.dining}
          contentFit='cover'
        />
        <View style={styles.coliving}>
          <LinearGradient
            colors={['#53C55E', '#11A8DA', '#903DC0']}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[StyleSheet.absoluteFill, styles.colivingOverlay]}
          />
          <Typography
            variant='display'
            size={isTablet ? 'lg' : 'md'}
            weight='bold'
            color={palette.white}
          >
            250+
          </Typography>
          <Typography
            variant='text'
            size={isTablet ? 'lg' : 'md'}
            weight='medium'
            color={palette.white}
            style={styles.center}
          >
            Coliving Spaces
          </Typography>
        </View>
        <Image
          source={ImageAssets.loginBento4}
          style={styles.living}
          contentFit='cover'
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    gap: GAP,
    width: '100%',
    minHeight: 0
  },
  compactRoot: {
    flex: 1,
    flexBasis: 0,
    flexShrink: 1,
    flexDirection: 'row',
    gap: GAP,
    width: '100%',
    minHeight: 0,
    overflow: 'hidden'
  },
  compactLiveBetter: {
    flex: 1,
    flexBasis: 0,
    minHeight: 0,
    borderTopRightRadius: RADIUS,
    borderBottomRightRadius: RADIUS,
    borderBottomLeftRadius: RADIUS,
    paddingHorizontal: '6%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  compactLiveBetterText: {
    width: '78%',
    maxHeight: '38%',
    aspectRatio: 201 / 86
  },
  compactWordmark: {
    width: '84%',
    maxHeight: '48%',
    aspectRatio: 217 / 124,
    marginTop: '2%'
  },
  compactRight: {
    width: 100,
    gap: GAP,
    minHeight: 0,
    flexShrink: 1
  },
  compactDining: {
    width: '100%',
    flex: 1,
    flexBasis: 0,
    minHeight: 0,
    borderRadius: RADIUS
  },
  compactColiving: {
    flex: 1,
    flexBasis: 0,
    minHeight: 0,
    borderRadius: RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: 4
  },
  left: {
    flex: 244,
    gap: GAP,
    alignItems: 'flex-end',
    minHeight: 0
  },
  hero: {
    width: '90%',
    flex: 130,
    borderRadius: RADIUS,
    minHeight: 0
  },
  leftRow: {
    width: '90%',
    flex: 92,
    flexDirection: 'row',
    gap: GAP,
    minHeight: 0
  },
  citiesTile: {
    width: '36%',
    maxWidth: 120,
    borderRadius: RADIUS,
    paddingHorizontal: 6,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    minHeight: 0
  },
  bedroom: {
    flex: 1,
    borderRadius: RADIUS,
    minHeight: 0
  },
  liveBetter: {
    width: '100%',
    flex: 242,
    borderTopRightRadius: RADIUS,
    borderBottomRightRadius: RADIUS,
    borderBottomLeftRadius: RADIUS,
    paddingHorizontal: '8%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    minHeight: 0
  },
  liveBetterText: {
    width: '82%',
    aspectRatio: 201 / 86
  },
  wordmark: {
    width: '88%',
    aspectRatio: 217 / 124,
    marginTop: '4%'
  },
  right: {
    flex: 138,
    gap: GAP,
    minHeight: 0
  },
  dining: {
    flex: 163,
    borderRadius: RADIUS,
    alignSelf: 'flex-start',
    width: '90%',
    minHeight: 0
  },
  coliving: {
    flex: 151,
    borderTopLeftRadius: RADIUS,
    borderBottomLeftRadius: RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: 8,
    minHeight: 0
  },
  colivingOverlay: {
    opacity: 0.9
  },
  living: {
    width: '90%',
    flex: 150,
    borderRadius: RADIUS,
    alignSelf: 'flex-start',
    minHeight: 0
  },
  center: {
    textAlign: 'center'
  }
})
