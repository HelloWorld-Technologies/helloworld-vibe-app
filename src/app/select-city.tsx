import { useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';

import { HwIcon } from '@/components/hw-icon';
import { HwLottie } from '@/components/hw-lottie';
import { Typography } from '@/components/ui/typography';
import { LottieAssets } from '@/constants/assets';
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

  function handleSelectCity(city: CityOption) {
    setSelectedCity(city.name);
    router.replace(getExploreHomeRoute(isTenant));
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
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

      <View style={styles.header}>
        <HwLottie source={LottieAssets.loginLoading} style={styles.headerLottie} loop />
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
              <HwIcon name={item.icon} size={34} />
            </View>
            <Typography variant="label" weight="medium" style={styles.cityName}>
              {item.name}
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
    backgroundColor: palette.blue[50],
  },
  topBar: {
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  backButtonPressed: {
    opacity: 0.85,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 8,
  },
  headerLottie: {
    width: 48,
    height: 36,
  },
  headerTitle: {
    textAlign: 'center',
  },
  grid: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  row: {
    gap: 8,
    marginBottom: 8,
  },
  cityCard: {
    flex: 1,
    maxWidth: '25%',
    alignItems: 'center',
    backgroundColor: palette.white,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
    minHeight: 88,
  },
  cityPressed: {
    opacity: 0.85,
    backgroundColor: palette.lightGreen,
  },
  iconWrap: {
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  cityName: {
    textAlign: 'center',
  },
});
