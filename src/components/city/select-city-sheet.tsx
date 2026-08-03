import { Image } from 'expo-image';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HwIcon } from '@/components/hw-icon';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Typography } from '@/components/ui/typography';
import { ImageAssets } from '@/constants/assets';
import { CITIES, type CityOption } from '@/constants/cities';
import palette from '@/constants/palette';
import { useAuthStore } from '@/stores/auth-store';

const NUM_COLUMNS = 4;

type SelectCitySheetProps = {
  visible: boolean;
  onClose: () => void;
};

function chunkCities(cities: CityOption[], size: number) {
  const rows: CityOption[][] = [];
  for (let i = 0; i < cities.length; i += size) {
    rows.push(cities.slice(i, i + size));
  }
  return rows;
}

export function SelectCitySheet({ visible, onClose }: SelectCitySheetProps) {
  const insets = useSafeAreaInsets();
  const setSelectedCity = useAuthStore((state) => state.setSelectedCity);
  const rows = chunkCities(CITIES, NUM_COLUMNS);

  function handleSelectCity(city: CityOption) {
    setSelectedCity(city.name);
    onClose();
  }

  return (
    <BottomSheet visible={visible} onClose={onClose}>
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={[styles.grid, { paddingBottom: insets.bottom + 20 }]}>
        {rows.map((row) => (
          <View key={row.map((city) => city.name).join('-')} style={styles.row}>
            {row.map((item) => (
              <Pressable
                key={item.name}
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
            ))}
            {row.length < NUM_COLUMNS
              ? Array.from({ length: NUM_COLUMNS - row.length }).map((_, index) => (
                  <View key={`spacer-${index}`} style={styles.cityCardSpacer} />
                ))
              : null}
          </View>
        ))}
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 20,
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
  },
  row: {
    flexDirection: 'row',
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
  cityCardSpacer: {
    flex: 1,
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
