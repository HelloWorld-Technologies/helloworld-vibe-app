import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
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
import type { PropertyListing } from '@/types/property';
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
  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useWishlistProperties();

  const properties = useMemo(
    () =>
      (data?.pages ?? []).flatMap((page) =>
        (page?.data ?? []).map(mapWishlistCardToListing),
      ),
    [data],
  );
  const totalCount = data?.pages?.[0]?.pageInfo?.total ?? properties.length;
  const bottomPadding = variant === 'tab' ? tabBarInset : Math.max(insets.bottom, 16);

  function handleRefresh() {
    void Promise.all([refetch(), refreshWishlist()]);
  }

  function handleEndReached() {
    if (!hasNextPage || isFetchingNextPage) return;
    void fetchNextPage();
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

  function renderHeader() {
    return (
      <View style={variant === 'tab' ? styles.header : styles.stackSubtitle}>
        {variant === 'tab' ? (
          <Typography variant="heading" weight="bold">
            Wishlist
          </Typography>
        ) : null}
        <Typography variant="text" size="sm" color={palette.textSecondary}>
          {properties.length > 0
            ? `${totalCount} saved ${totalCount === 1 ? 'property' : 'properties'}`
            : 'Saved properties will appear here.'}
        </Typography>
      </View>
    );
  }

  function renderFooter() {
    if (!hasNextPage && !isFetchingNextPage) return null;

    return (
      <View style={styles.footer}>
        {isFetchingNextPage ? (
          <ActivityIndicator color={palette.helloLime} />
        ) : (
          <Pressable onPress={() => void fetchNextPage()} style={styles.loadMore}>
            <Typography variant="text" size="sm" weight="medium" color={palette.blue[600]}>
              Load more
            </Typography>
          </Pressable>
        )}
      </View>
    );
  }

  function renderProperty({ item: property }: { item: PropertyListing }) {
    const imageUri =
      typeof property.images[0] === 'object' && property.images[0] && 'uri' in property.images[0]
        ? property.images[0].uri
        : undefined;

    return (
      <PropertyCard
        property={property}
        onPress={() => openProperty(property.id, property.name, imageUri)}
      />
    );
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

    if (isLoading) {
      return (
        <View style={styles.flex}>
          {renderHeader()}
          <ActivityIndicator color={palette.helloLime} style={styles.loader} />
        </View>
      );
    }

    if (isError) {
      return (
        <View style={styles.flex}>
          {renderHeader()}
          <View style={styles.centered}>
            <Typography variant="body" color={palette.textSecondary} style={styles.subtitle}>
              Unable to load your wishlist right now.
            </Typography>
            <Button label="Try again" onPress={handleRefresh} style={styles.cta} />
          </View>
        </View>
      );
    }

    if (properties.length === 0) {
      return (
        <View style={styles.flex}>
          {renderHeader()}
          <EmptyState
            fill
            title="Your wishlist is empty"
            subtitle="Tap the heart on any property to save it here."
            actionLabel="Browse Properties"
            onAction={() => router.push('/')}
          />
        </View>
      );
    }

    return (
      <FlatList
        data={properties}
        keyExtractor={(item) => item.id}
        renderItem={renderProperty}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        contentContainerStyle={[styles.list, { paddingBottom: bottomPadding }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.4}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} />}
      />
    );
  }

  if (variant === 'stack') {
    return (
      <ProfileStackScreen title="My Wishlist" centerTitle style={styles.stackBody}>
        {renderContent()}
      </ProfileStackScreen>
    );
  }

  return <TabScreen contentStyle={styles.screen}>{renderContent()}</TabScreen>;
}

const styles = StyleSheet.create({
  screen: {
    paddingBottom: 0,
  },
  stackBody: {
    paddingHorizontal: 0,
  },
  flex: {
    flex: 1,
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
  loader: {
    marginTop: 32,
  },
  list: {
    paddingHorizontal: 20,
    gap: 20,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadMore: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
});
