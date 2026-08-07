import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { HwSymbol } from '@/components/ui/hw-symbol';
import { getKbCategories } from '@/api/tickets';
import { CreateTicketBanner } from '@/components/support/create-ticket-banner';
import { ProfileStackScreen } from '@/components/profile/profile-stack-screen';
import { CategoryListSkeleton } from '@/components/skeleton';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import type { TicketCategory } from '@/types/ticket';

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
          <View style={styles.list}>
            {categories.map((category, index) => {
              if (!category.isVisibleInHC || category.visibility !== 'ALL_USERS') {
                return null;
              }

              const preview = (category.child ?? [])
                .filter((child) => child.isVisibleInHC !== false)
                .slice(0, 4)
                .map((child) => child.name)
                .join(', ');

              return (
                <Pressable
                  key={`${category.name}-${index}`}
                  style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                  onPress={() => openSubcategories(category)}
                  accessibilityRole="button">
                  <View style={styles.cardCircle} />
                  <View style={styles.cardContent}>
                    <Typography variant="text" size="md" weight="bold">
                      {category.name}
                    </Typography>
                    {preview ? (
                      <Typography variant="label" size="xs" color={palette.gray[500]} numberOfLines={2}>
                        {preview} etc.
                      </Typography>
                    ) : null}
                  </View>
                  <HwSymbol name="chevron.right" size={16} tintColor={palette.gray[500]} />
                </Pressable>
              );
            })}

            <Pressable
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={() => router.push('/profile/move-out')}
              accessibilityRole="button">
              <View style={styles.cardCircle} />
              <View style={styles.cardContent}>
                <Typography variant="text" size="md" weight="bold">
                  Move out
                </Typography>
                <Typography variant="label" size="xs" color={palette.gray[500]}>
                  You can request for moveout from here
                </Typography>
              </View>
              <HwSymbol name="chevron.right" size={16} tintColor={palette.gray[500]} />
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
  list: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: palette.gray[200],
    backgroundColor: palette.gray[50],
    overflow: 'hidden',
  },
  cardPressed: {
    opacity: 0.92,
  },
  cardCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 20,
    borderColor: palette.yellow[200],
    opacity: 0.15,
    top: -50,
    right: -60,
  },
  cardContent: {
    flex: 1,
    gap: 4,
  },
  error: {
    textAlign: 'center',
    marginTop: 8,
  },
});
