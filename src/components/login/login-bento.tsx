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

export function LoginBento ({ compact = false }: LoginBentoProps) {
  const { width, height } = useWindowDimensions()
  const isTablet = Math.min(width, height) >= 600

  if (compact) {
    return (
      <View style={styles.compactRoot}>
        <View style={styles.compactLeft}>
          <Image
            source={ImageAssets.loginBento1}
            style={styles.compactHero}
            contentFit='cover'
          />
          <LinearGradient
            colors={['#32ACDD', '#7474CF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.compactCities}
          >
            <Typography
              variant={isTablet ? 'display' : 'text'}
              size='sm'
              weight='bold'
              color={palette.white}
            >
              16+
            </Typography>
            <Typography
              variant='text'
              size={isTablet ? 'md' : 'xs'}
              weight='medium'
              color={palette.white}
            >
              Cities
            </Typography>
          </LinearGradient>
        </View>
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
              variant={isTablet ? 'display' : 'text'}
              size='sm'
              weight='bold'
              color={palette.white}
            >
              250+
            </Typography>
            <Typography
              variant='text'
              size={isTablet ? 'md' : 'xs'}
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
              variant='display'
              size={isTablet ? 'lg' : 'md'}
              weight='bold'
              color={palette.white}
            >
              16+
            </Typography>
            <Typography
              variant='text'
              size={isTablet ? 'md' : 'xs'}
              weight='medium'
              color={palette.white}
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
        <LinearGradient
          colors={[
            'rgba(83,197,94,0.89)',
            'rgba(17,168,218,0.89)',
            'rgba(144,61,192,0.89)'
          ]}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
          style={styles.liveBetter}
        >
          <Image
            source={ImageAssets.loginLiveBetterText}
            style={styles.liveBetterText}
            contentFit='contain'
          />
          <Image
            source={ImageAssets.loginHelloWorldWordmark}
            style={styles.wordmark}
            contentFit='contain'
          />
        </LinearGradient>
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
    flexDirection: 'row',
    gap: GAP,
    width: '100%'
  },
  compactLeft: {
    flex: 1,
    flexDirection: 'row',
    gap: GAP
  },
  compactHero: {
    flex: 1,
    height: 102,
    borderRadius: RADIUS
  },
  compactCities: {
    width: 72,
    height: 72,
    borderRadius: RADIUS,
    alignItems: 'center',
    justifyContent: 'center'
  },
  compactRight: {
    width: 100,
    gap: GAP
  },
  compactDining: {
    width: '100%',
    height: 72,
    borderRadius: RADIUS
  },
  compactColiving: {
    height: 72,
    borderRadius: RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
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
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center'
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
