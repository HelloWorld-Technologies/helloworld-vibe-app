import { useRouter } from 'expo-router';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TabScreen } from '@/components/navigation/tab-screen';
import { ProfileStackScreen } from '@/components/profile/profile-stack-screen';
import { EmptyState } from '@/components/ui/empty-state';
import { PropertyCard } from '@/components/property/property-card';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { useTabBarInset } from '@/hooks/use-tab-bar-inset';
import { useWishlist } from '@/providers/wishlist-provider';
import { useWishlistProperties } from '@/queries/use-wishlist-properties';
import { useIsAuthenticated } from '@/stores/auth-store';
import { mapWishlistCardToListing } from '@/utils/map-wishlist-card';

type WishlistScreenProps = {
  variant?: 'tab' | 'stack';
};

export function WishlistScreen({ variant = 'tab' }: WishlistScreenProps) {
  const router = useRouter();
  const tabBarInset = useTabBarInset(0);
  const insets = useSafeAreaInsets();
  const isAuthenticated = useIsAuthenticated();
  const { refreshWishlist } = useWishlist();
  const { data: cards = [], isLoading, isError, refetch, isRefetching } = useWishlistProperties();

  const properties = cards.map(mapWishlistCardToListing);
  const bottomPadding = variant === 'tab' ? tabBarInset : Math.max(insets.bottom, 16);

  function handleRefresh() {
    void Promise.all([refetch(), refreshWishlist()]);
  }

  function openProperty(propertyId: string, name: string, imageUri?: string) {
    router.push({
      pathname: '/hdp',
      params: {
        id: propertyId,
        name,
        image: imageUri,
      },
    });
  }

  function renderContent() {
    if (!isAuthenticated) {
      return (
        <View style={styles.centered}>
          {variant === 'tab' ? (
            <Typography variant="heading" weight="bold">
              Wishlist
            </Typography>
          ) : null}
          <Typography variant="body" color={palette.textSecondary} style={styles.subtitle}>
            Sign in to save properties and view them here.
          </Typography>
          <Button label="Sign in" onPress={() => router.push('/login')} style={styles.cta} />
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPadding }]}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} />
        }>
        <View style={variant === 'tab' ? styles.header : styles.stackSubtitle}>
          {variant === 'tab' ? (
            <Typography variant="heading" weight="bold">
              Wishlist
            </Typography>
          ) : null}
          <Typography variant="text" size="sm" color={palette.textSecondary}>
            {properties.length > 0
              ? `${properties.length} saved ${properties.length === 1 ? 'property' : 'properties'}`
              : 'Saved properties will appear here.'}
          </Typography>
        </View>

        {isLoading ? (
          <ActivityIndicator color={palette.helloLime} style={styles.loader} />
        ) : isError ? (
          <View style={styles.centered}>
            <Typography variant="body" color={palette.textSecondary} style={styles.subtitle}>
              Unable to load your wishlist right now.
            </Typography>
            <Button label="Try again" onPress={handleRefresh} style={styles.cta} />
          </View>
        ) : properties.length === 0 ? (
          <EmptyState
            fill
            title="Your wishlist is empty"
            subtitle="Tap the heart on any property to save it here."
            actionLabel="Browse Properties"
            onAction={() => router.push('/')}
          />
        ) : (
          <View style={styles.list}>
            {properties.map((property) => {
              const imageUri =
                typeof property.images[0] === 'object' &&
                property.images[0] &&
                'uri' in property.images[0]
                  ? property.images[0].uri
                  : undefined;

              return (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onPress={() => openProperty(property.id, property.name, imageUri)}
                />
              );
            })}
          </View>
        )}
      </ScrollView>
    );
  }

  if (variant === 'stack') {
    return (
      <ProfileStackScreen title="My Wishlist" centerTitle style={styles.stackBody}>
        {renderContent()}
      </ProfileStackScreen>
    );
  }

  return (
    <TabScreen contentStyle={styles.screen}>
      {renderContent()}
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingBottom: 0,
  },
  stackBody: {
    paddingHorizontal: 0,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 4,
  },
  stackSubtitle: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  subtitle: {
    textAlign: 'center',
  },
  cta: {
    minWidth: 160,
    marginTop: 8,
  },
  scrollView: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
  },
  loader: {
    marginTop: 32,
  },
  list: {
    paddingHorizontal: 20,
    gap: 20,
  },
});
