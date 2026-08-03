import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';

import { HwIcon } from '@/components/hw-icon';
import { Typography } from '@/components/ui/typography';
import { ImageAssets } from '@/constants/assets';
import { CITIES, type CityOption } from '@/constants/cities';
import palette from '@/constants/palette';
import { useAuthStore } from '@/stores/auth-store';
import { useIsTenant } from '@/stores/tenant-store';
import { getExploreHomeRoute } from '@/utils/tenant-routing';

const NUM_COLUMNS = 4;

export default function SelectCityScreen() {
  const router = useRouter();
  const isTenant = useIsTenant();
  const setSelectedCity = useAuthStore((state) => state.setSelectedCity);
  const canGoBack = router.canGoBack();

  function handleSelectCity(city: CityOption) {
    setSelectedCity(city.name);
    router.replace(getExploreHomeRoute(isTenant));
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {canGoBack ? (
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <SymbolView
              name="chevron.left"
              size={18}
              weight="semibold"
              tintColor={palette.gray[800]}
            />
          </Pressable>
        </View>
      ) : null}

      <View style={styles.header}>
        <Image
          source={ImageAssets.chooseCityIcon}
          style={styles.headerIcon}
          contentFit="contain"
          accessibilityIgnoresInvertColors
        />
        <Typography variant="heading" weight="bold" style={styles.headerTitle}>
          Pick your city to get started!
        </Typography>
      </View>

      <FlatList
        data={CITIES}
        keyExtractor={(item) => item.name}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.cityCard, pressed && styles.cityPressed]}
            onPress={() => handleSelectCity(item)}
            accessibilityRole="button"
            accessibilityLabel={`Select ${item.name}`}>
            <View style={styles.iconWrap}>
              <HwIcon name={item.icon} size={36} />
            </View>
            <Typography variant="label" weight="medium" style={styles.cityName}>
              {item.label ?? item.name}
            </Typography>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.white,
  },
  topBar: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonPressed: {
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 28,
    gap: 12,
  },
  headerIcon: {
    width: 52,
    height: 40,
  },
  headerTitle: {
    flex: 1,
    color: palette.gray[900],
  },
  grid: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  row: {
    gap: 10,
    marginBottom: 10,
  },
  cityCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.gray[100],
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 4,
    minHeight: 96,
  },
  cityPressed: {
    opacity: 0.85,
    backgroundColor: palette.gray[200],
  },
  iconWrap: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cityName: {
    textAlign: 'center',
    color: palette.gray[900],
  },
});
