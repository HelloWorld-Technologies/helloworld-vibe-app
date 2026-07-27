import { useInfiniteQuery } from '@tanstack/react-query';

import { fetchWishlistPropertyCards, WISHLIST_PAGE_SIZE } from '@/api/wishlist';
import { useWishlist } from '@/providers/wishlist-provider';
import { useIsAuthenticated } from '@/stores/auth-store';

function getNextWishlistPage(
  nextPage: number | boolean | null | undefined,
  lastPageParam: number,
): number | undefined {
  if (!nextPage) return undefined;
  return typeof nextPage === 'number' ? nextPage : lastPageParam + 1;
}

export function useWishlistProperties() {
  const isAuthenticated = useIsAuthenticated();
  const { revision } = useWishlist();

  return useInfiniteQuery({
    // Distinct from the old useQuery key so cached array payloads aren't reused.
    queryKey: ['wishlist', 'cards', 'infinite', revision],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      fetchWishlistPropertyCards({
        page: pageParam,
        page_size: WISHLIST_PAGE_SIZE,
      }),
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      getNextWishlistPage(lastPage?.pageInfo?.nextPage, lastPageParam),
    enabled: isAuthenticated,
  });
}
