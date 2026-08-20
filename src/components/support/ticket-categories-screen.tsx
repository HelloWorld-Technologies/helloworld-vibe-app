import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { getKbCategories } from '@/api/tickets';
import { CreateTicketBanner } from '@/components/support/create-ticket-banner';
import { ProfileStackScreen } from '@/components/profile/profile-stack-screen';
import { CategoryListSkeleton } from '@/components/skeleton';
import { HwSymbol } from '@/components/ui/hw-symbol';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import type { TicketCategory } from '@/types/ticket';
import { getSupportCategoryIcon } from '@/utils/support-category-icons';

export function TicketCategoriesScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<TicketCategory[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    void (async () => {
      const { data, message } = await getKbCategories();
      if (data.length === 0 && message) {
        setError(message);
      }
      setCategories(data);
    })();
  }, []);

  function openSubcategories(category: TicketCategory) {
    router.push({
      pathname: '/ticket-subcategories',
      params: {
        category: category.name,
        child: JSON.stringify(category.child ?? []),
      },
    });
  }

  const visibleCategories =
    categories?.filter(
      (category) => category.isVisibleInHC && category.visibility === 'ALL_USERS',
    ) ?? [];

  return (
    <ProfileStackScreen title="Create New Ticket" centerTitle style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}>
        <CreateTicketBanner />

        {categories === null ? (
          <CategoryListSkeleton style={styles.loader} />
        ) : (
          <View style={styles.grid}>
            {visibleCategories.map((category, index) => (
              <Pressable
                key={`${category.name}-${index}`}
                style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                onPress={() => openSubcategories(category)}
                accessibilityRole="button">
                <HwSymbol
                  name={getSupportCategoryIcon(category.name) as never}
                  size={24}
                  tintColor={palette.gray[700]}
                />
                <Typography
                  variant="label"
                  size="xs"
                  weight="medium"
                  color={palette.gray[700]}
                  style={styles.cardLabel}
                  numberOfLines={2}>
                  {category.name}
                </Typography>
              </Pressable>
            ))}

            <Pressable
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={() =>
                router.push({
                  pathname: '/profile/move-out',
                  params: { from: 'support' },
                })
              }
              accessibilityRole="button">
              <HwSymbol
                name={getSupportCategoryIcon('Move out') as never}
                size={24}
                tintColor={palette.gray[700]}
              />
              <Typography
                variant="label"
                size="xs"
                weight="medium"
                color={palette.gray[700]}
                style={styles.cardLabel}
                numberOfLines={2}>
                Move out
              </Typography>
            </Pressable>

            {error ? (
              <Typography variant="text" size="sm" color={palette.error} style={styles.error}>
                {error}
              </Typography>
            ) : null}
          </View>
        )}
      </ScrollView>
    </ProfileStackScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: palette.white,
  },
  scroll: {
    padding: 20,
    gap: 16,
    paddingBottom: 32,
  },
  loader: {
    marginTop: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  card: {
    width: '31.5%',
    height: 84,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: palette.gray[200],
    backgroundColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 10,
  },
  cardPressed: {
    opacity: 0.92,
    backgroundColor: palette.blue[50],
  },
  cardLabel: {
    textAlign: 'center',
  },
  error: {
    width: '100%',
    textAlign: 'center',
    marginTop: 8,
  },
});
