import { useRouter } from 'expo-router';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { Snackbar } from '@/components/ui/snackbar';
import {
  addWishlistProperty,
  fetchWishlistPropertyIds,
  removeWishlistProperty,
} from '@/api/wishlist';
import { useAuthHydrated, useIsAuthenticated } from '@/stores/auth-store';

interface WishlistContextValue {
  isWishlisted: (propertyId: number) => boolean;
  toggleWishlist: (propertyId: number, propertyName?: string) => Promise<void>;
  refreshWishlist: () => Promise<void>;
  isLoading: boolean;
  revision: number;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const hydrated = useAuthHydrated();
  const isAuthenticated = useIsAuthenticated();
  const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [revision, setRevision] = useState(0);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const showSnackbar = useCallback((message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  }, []);

  const dismissSnackbar = useCallback(() => {
    setSnackbarVisible(false);
  }, []);

  const refreshWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlistIds(new Set());
      return;
    }

    setIsLoading(true);
    const ids = await fetchWishlistPropertyIds();
    setWishlistIds(new Set(ids));
    setIsLoading(false);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!hydrated) return;
    void refreshWishlist();
  }, [hydrated, refreshWishlist]);

  const isWishlisted = useCallback(
    (propertyId: number) => wishlistIds.has(propertyId),
    [wishlistIds],
  );

  const applyWishlistChange = useCallback(
    async (propertyId: number, shouldSave: boolean, propertyName?: string) => {
      setWishlistIds((current) => {
        const next = new Set(current);
        if (shouldSave) {
          next.add(propertyId);
        } else {
          next.delete(propertyId);
        }
        return next;
      });

      const response = shouldSave
        ? await addWishlistProperty(propertyId)
        : await removeWishlistProperty(propertyId);

      if (!response.success) {
        setWishlistIds((current) => {
          const next = new Set(current);
          if (shouldSave) {
            next.delete(propertyId);
          } else {
            next.add(propertyId);
          }
          return next;
        });
        showSnackbar('Could not update wishlist. Please try again.');
        return;
      }

      setRevision((current) => current + 1);

      const label = propertyName?.trim();
      showSnackbar(
        shouldSave
          ? label
            ? `${label} added to wishlist`
            : 'Added to wishlist'
          : label
            ? `${label} removed from wishlist`
            : 'Removed from wishlist',
      );
    },
    [showSnackbar],
  );

  const toggleWishlist = useCallback(
    async (propertyId: number, propertyName?: string) => {
      if (!isAuthenticated) {
        Alert.alert('Sign in to save', 'Log in to add properties to your wishlist.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign in', onPress: () => router.push('/login') },
        ]);
        return;
      }

      await applyWishlistChange(propertyId, !wishlistIds.has(propertyId), propertyName);
    },
    [applyWishlistChange, isAuthenticated, router, wishlistIds],
  );

  const value = useMemo(
    () => ({
      isWishlisted,
      toggleWishlist,
      refreshWishlist,
      isLoading,
      revision,
    }),
    [isLoading, isWishlisted, refreshWishlist, revision, toggleWishlist],
  );

  return (
    <WishlistContext.Provider value={value}>
      <View style={styles.root}>
        {children}
        <Snackbar
          message={snackbarMessage}
          visible={snackbarVisible}
          onDismiss={dismissSnackbar}
        />
      </View>
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
}

export function useOptionalWishlist() {
  return useContext(WishlistContext);
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
