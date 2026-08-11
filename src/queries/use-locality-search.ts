import { useQuery } from '@tanstack/react-query';

import { fetchLocalitySuggestions } from '@/api/search';
import { useDebounce } from '@/hooks/use-debounce';
import { queryKeys } from '@/queries/keys';

const MIN_KEYWORD_LENGTH = 3;
const DEBOUNCE_MS = 300;

export function useLocalitySearch(keyword: string, city: string) {
  const trimmedKeyword = keyword.trim();
  const debouncedKeyword = useDebounce(trimmedKeyword, DEBOUNCE_MS);
  // Disable immediately when input drops below threshold so loaders don't
  // linger over recent-search history while debounce catches up.
  const enabled =
    trimmedKeyword.length >= MIN_KEYWORD_LENGTH &&
    debouncedKeyword.length >= MIN_KEYWORD_LENGTH;

  return useQuery({
    queryKey: queryKeys.localitySearch(city, debouncedKeyword),
    queryFn: () =>
      fetchLocalitySuggestions({
        city,
        keyword: debouncedKeyword,
      }),
    enabled,
    staleTime: 60_000,
  });
}
