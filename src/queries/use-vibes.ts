import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getUserVibes, getVibesList, postUserVibes } from '@/api/vibes';
import { queryKeys } from '@/queries/keys';
import { useIsAuthenticated } from '@/stores/auth-store';
import type { Vibe } from '@/types/vibes';

export function useVibesList() {
  return useQuery({
    queryKey: queryKeys.vibesList,
    queryFn: async () => {
      const result = await getVibesList();
      return result.data ?? [];
    },
  });
}

export function useUserVibes() {
  const isAuthenticated = useIsAuthenticated();

  return useQuery({
    queryKey: queryKeys.userVibes,
    queryFn: async () => {
      const result = await getUserVibes();
      return result.data ?? [];
    },
    enabled: isAuthenticated,
  });
}

export function useSaveUserVibes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vibeIds: number[]) => {
      const result = await postUserVibes(vibeIds);
      if (result.success === false) {
        throw new Error(result.message ?? 'Failed to save vibes');
      }
      return { ...result, vibeIds };
    },
    onSuccess: (result) => {
      const list = queryClient.getQueryData<Vibe[]>(queryKeys.vibesList);
      if (list?.length) {
        queryClient.setQueryData(
          queryKeys.userVibes,
          list.filter((vibe) => result.vibeIds.includes(vibe.id)),
        );
      }
      void queryClient.invalidateQueries({ queryKey: queryKeys.userVibes });
    },
  });
}
