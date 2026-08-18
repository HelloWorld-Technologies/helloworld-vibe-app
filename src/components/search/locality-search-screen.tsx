import { useRouter } from 'expo-router';
import { HwSymbol } from '@/components/ui/hw-symbol';
import { useState } from 'react';
import {
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LocalityResultSkeleton } from '@/components/skeleton';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { useLocalitySearch } from '@/queries/use-locality-search';
import { useAuthStore, useSelectedCity } from '@/stores/auth-store';
import {
  normalizeSearchHistoryItem,
  useSearchHistory,
  useSearchHistoryStore,
} from '@/stores/search-history-store';
import type { SearchHistoryItem, SearchPropertyResult } from '@/types/search';

const RESULT_ENTER_MS = 220;
const RESULT_STAGGER_MS = 45;

type SearchResultRowProps = {
  index: number;
  label: string;
  icon: 'mappin.and.ellipse' | 'building.2' | 'clock';
  onPress: () => void;
  accessibilityLabel: string;
  animate?: boolean;
};

function SearchResultRow({
  index,
  label,
  icon,
  onPress,
  accessibilityLabel,
  animate = true,
}: SearchResultRowProps) {
  const row = (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.resultRow, pressed && styles.resultRowPressed]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}>
      <HwSymbol name={icon} size={20} tintColor={palette.gray[700]} style={styles.resultIcon} />
      <Typography variant="text" size="md" style={styles.resultLabel} numberOfLines={2}>
        {label}
      </Typography>
    </Pressable>
  );

  if (!animate) {
    return row;
  }

  return (
    <Animated.View entering={FadeInDown.duration(RESULT_ENTER_MS).delay(index * RESULT_STAGGER_MS)}>
      {row}
    </Animated.View>
  );
}

export function LocalitySearchScreen() {
  const router = useRouter();
  const city = useSelectedCity();
  const setSelectedLocality = useAuthStore((state) => state.setSelectedLocality);
  const addSearch = useSearchHistoryStore((state) => state.addSearch);
  const history = useSearchHistory(city);

  const [keyword, setKeyword] = useState('');
  const { data, isFetching, isFetched } = useLocalitySearch(keyword, city);

  const results = data?.success ? data.data : null;
  const localities = results?.locality ?? [];
  const properties = results?.properties ?? [];
  const trimmedKeyword = keyword.trim();
  const hasInput = trimmedKeyword.length > 0;
  const hasKeyword = trimmedKeyword.length >= 3;
  const showHistory = !hasInput && history.length > 0;
  const showNoLocality =
    hasKeyword && isFetched && !isFetching && localities.length === 0;
  const showEmptyState =
    showNoLocality && properties.length === 0;
  const resultSetKey = `${city}-${trimmedKeyword.toLowerCase()}`;

  function afterKeyboard(action: () => void) {
    Keyboard.dismiss();
    if (Platform.OS === 'android') {
      setTimeout(action, 80);
      return;
    }
    action();
  }

  function handleSelectLocality(locality: string) {
    const nextLocality = locality.trim();
    if (!nextLocality) return;
    afterKeyboard(() => {
      addSearch(city, {
        type: 'locality',
        id: `locality:${nextLocality.toLowerCase()}`,
        label: nextLocality,
        locality: nextLocality,
      });
      setSelectedLocality(nextLocality);
      router.replace('/srp');
    });
  }

  function handleShowAllProperties() {
    afterKeyboard(() => {
      setSelectedLocality(null);
      router.replace('/srp');
    });
  }

  function handleSelectProperty(property: SearchPropertyResult) {
    const propertyId = Number(property.id);
    const propertyName = property.name?.trim();
    if (!Number.isFinite(propertyId) || propertyId <= 0 || !propertyName) return;
    afterKeyboard(() => {
      addSearch(city, {
        type: 'property',
        id: `property:${propertyId}`,
        label: propertyName,
        propertyId,
        propertyName,
      });
      router.replace({
        pathname: '/hdp',
        params: { id: String(propertyId), name: propertyName },
      });
    });
  }

  function handleSelectHistory(item: SearchHistoryItem) {
    const normalized = normalizeSearchHistoryItem(item);
    if (!normalized) return;
    if (normalized.type === 'locality') {
      handleSelectLocality(normalized.locality);
      return;
    }
    handleSelectProperty({
      id: normalized.propertyId,
      name: normalized.propertyName,
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
            <HwSymbol
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

      {isFetching && hasKeyword ? (
        <LocalityResultSkeleton style={styles.loader} />
      ) : null}

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.results}
        showsVerticalScrollIndicator={false}>
        {showHistory ? (
          <View style={styles.section}>
            <Typography variant="text" size="sm" weight="medium" color={palette.textSecondary}>
              Recent searches
            </Typography>
            {history
              .map(normalizeSearchHistoryItem)
              .filter((item): item is SearchHistoryItem => item != null)
              .map((item, index) => (
                <SearchResultRow
                  key={item.id}
                  index={index}
                  label={item.label}
                  icon="clock"
                  animate={false}
                  onPress={() => handleSelectHistory(item)}
                  accessibilityLabel={`Open recent search ${item.label}`}
                />
              ))}
          </View>
        ) : null}

        {hasKeyword && !isFetching && localities.length > 0 ? (
          <View key={`localities-${resultSetKey}`} style={styles.section}>
            <Animated.View entering={FadeIn.duration(180)}>
              <Typography variant="text" size="sm" weight="medium" color={palette.textSecondary}>
                Localities
              </Typography>
            </Animated.View>
            {localities.map((item, index) => (
              <SearchResultRow
                key={`${item}-${index}`}
                index={index}
                label={item}
                icon="mappin.and.ellipse"
                onPress={() => handleSelectLocality(item)}
                accessibilityLabel={`Select ${item}`}
              />
            ))}
          </View>
        ) : null}

        {hasKeyword && !isFetching && properties.length > 0 ? (
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
                No matching locality found for &quot;{trimmedKeyword}&quot;.
              </Typography>
            )}
            <Button label="Show all properties" onPress={handleShowAllProperties} />
          </Animated.View>
        ) : null}

        {!hasInput && !showHistory ? (
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
    paddingHorizontal: 20,
    marginTop: 8,
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
