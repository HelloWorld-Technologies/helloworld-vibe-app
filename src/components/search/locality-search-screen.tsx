import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { useLocalitySearch } from '@/queries/use-locality-search';
import { useAuthStore, useSelectedCity } from '@/stores/auth-store';
import type { SearchPropertyResult } from '@/types/search';

const RESULT_ENTER_MS = 220;
const RESULT_STAGGER_MS = 45;

type SearchResultRowProps = {
  index: number;
  label: string;
  icon: 'mappin.and.ellipse' | 'building.2';
  onPress: () => void;
  accessibilityLabel: string;
};

function SearchResultRow({
  index,
  label,
  icon,
  onPress,
  accessibilityLabel,
}: SearchResultRowProps) {
  return (
    <Animated.View entering={FadeInDown.duration(RESULT_ENTER_MS).delay(index * RESULT_STAGGER_MS)}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.resultRow, pressed && styles.resultRowPressed]}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}>
        <SymbolView name={icon} size={20} tintColor={palette.gray[700]} style={styles.resultIcon} />
        <Typography variant="text" size="md" style={styles.resultLabel} numberOfLines={2}>
          {label}
        </Typography>
      </Pressable>
    </Animated.View>
  );
}

export function LocalitySearchScreen() {
  const router = useRouter();
  const city = useSelectedCity();
  const setSelectedLocality = useAuthStore((state) => state.setSelectedLocality);

  const [keyword, setKeyword] = useState('');
  const { data, isFetching, isFetched } = useLocalitySearch(keyword, city);

  const results = data?.success ? data.data : null;
  const localities = results?.locality ?? [];
  const properties = results?.properties ?? [];
  const hasKeyword = keyword.trim().length >= 3;
  const showNoLocality =
    hasKeyword && isFetched && !isFetching && localities.length === 0;
  const showEmptyState =
    showNoLocality && properties.length === 0;
  const resultSetKey = `${city}-${keyword.trim().toLowerCase()}`;

  function handleSelectLocality(locality: string) {
    Keyboard.dismiss();
    setSelectedLocality(locality);
    router.replace('/srp');
  }

  function handleShowAllProperties() {
    Keyboard.dismiss();
    setSelectedLocality(null);
    router.replace('/srp');
  }

  function handleSelectProperty(property: SearchPropertyResult) {
    Keyboard.dismiss();
    router.replace({
      pathname: '/hdp',
      params: { id: String(property.id), name: property.name },
    });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
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

          <SearchInput
            showShadow={false}
            value={keyword}
            onChangeText={setKeyword}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
            autoFocus
            containerStyle={styles.searchInput}
          />
        </View>

        <Typography variant="text" size="xs" color={palette.textSecondary} style={styles.cityHint}>
          Searching in {city}
        </Typography>
      </View>

      {isFetching ? (
        <View style={styles.loader}>
          <ActivityIndicator size="small" color={palette.helloLime} />
        </View>
      ) : null}

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.results}
        showsVerticalScrollIndicator={false}>
        {localities.length > 0 ? (
          <View key={`localities-${resultSetKey}`} style={styles.section}>
            <Animated.View entering={FadeIn.duration(180)}>
              <Typography variant="text" size="sm" weight="medium" color={palette.textSecondary}>
                Localities
              </Typography>
            </Animated.View>
            {localities.map((item, index) => (
              <SearchResultRow
                key={item}
                index={index}
                label={item}
                icon="mappin.and.ellipse"
                onPress={() => handleSelectLocality(item)}
                accessibilityLabel={`Select ${item}`}
              />
            ))}
          </View>
        ) : null}

        {properties.length > 0 ? (
          <View key={`properties-${resultSetKey}`} style={styles.section}>
            <Animated.View entering={FadeIn.duration(180)}>
              <Typography variant="text" size="sm" weight="medium" color={palette.textSecondary}>
                HelloWorld Properties
              </Typography>
            </Animated.View>
            {properties.map((item, index) => (
              <SearchResultRow
                key={item.id}
                index={index}
                label={item.name}
                icon="building.2"
                onPress={() => handleSelectProperty(item)}
                accessibilityLabel={`Open ${item.name}`}
              />
            ))}
          </View>
        ) : null}

        {showNoLocality ? (
          <Animated.View entering={FadeIn.duration(200)} style={styles.emptyActions}>
            {showEmptyState ? (
              <Typography variant="text" size="md" color={palette.textSecondary} style={styles.empty}>
                No results found
              </Typography>
            ) : (
              <Typography variant="text" size="sm" color={palette.textSecondary} style={styles.empty}>
                No matching locality found for "{keyword.trim()}".
              </Typography>
            )}
            <Button label="Show all properties" onPress={handleShowAllProperties} />
          </Animated.View>
        ) : null}

        {!hasKeyword ? (
          <Typography variant="text" size="sm" color={palette.textSecondary} style={styles.empty}>
            Type at least 3 characters to search localities, offices, or colleges.
          </Typography>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.white,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  backButtonPressed: {
    opacity: 0.85,
  },
  searchInput: {
    flex: 1,
    marginBottom: 0,
  },
  cityHint: {
    marginLeft: 52,
  },
  loader: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  results: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 20,
  },
  section: {
    gap: 4,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.gray[200],
  },
  resultRowPressed: {
    opacity: 0.7,
  },
  resultIcon: {
    width: 20,
    height: 20,
    flexShrink: 0,
  },
  resultLabel: {
    flex: 1,
    textTransform: 'capitalize',
  },
  empty: {
    paddingTop: 8,
  },
  emptyActions: {
    gap: 16,
    paddingTop: 8,
  },
});
