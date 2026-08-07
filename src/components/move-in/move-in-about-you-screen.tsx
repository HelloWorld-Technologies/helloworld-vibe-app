import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProfileStackScreen } from '@/components/profile/profile-stack-screen';
import { VibeGridSkeleton } from '@/components/skeleton';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { VibeSelectionList } from '@/components/vibe/vibe-selection-list';
import palette from '@/constants/palette';
import {
  mapVibesToListItems,
  MOVE_IN_INTERESTS_MAX,
  MOVE_IN_INTERESTS_MIN,
} from '@/constants/vibes';
import { useSaveUserVibes, useUserVibes, useVibesList } from '@/queries/use-vibes';
import { useTenantStore } from '@/stores/tenant-store';
import type { Vibe } from '@/types/vibes';

function toChipId(id: number) {
  return String(id);
}

function resolveVibeIds(selectedIds: string[], apiVibes: Vibe[]) {
  const resolved: number[] = [];

  for (const selected of selectedIds) {
    const asNumber = Number(selected);
    if (Number.isFinite(asNumber) && asNumber > 0) {
      const byId = apiVibes.find((vibe) => vibe.id === asNumber);
      if (byId) {
        resolved.push(byId.id);
        continue;
      }
    }

    const byCode = apiVibes.find(
      (vibe) => vibe.code.toLowerCase() === selected.toLowerCase(),
    );
    if (byCode) {
      resolved.push(byCode.id);
    }
  }

  return [...new Set(resolved)].slice(0, MOVE_IN_INTERESTS_MAX);
}

export function MoveInAboutYouScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ from?: string }>();
  const fromMenu = params.from === 'menu';
  const savedInterests = useTenantStore((state) => state.moveInInterests);
  const setMoveInInterests = useTenantStore((state) => state.setMoveInInterests);

  const vibesListQuery = useVibesList();
  const userVibesQuery = useUserVibes();
  const saveVibes = useSaveUserVibes();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [didPrefill, setDidPrefill] = useState(false);

  const apiVibes = vibesListQuery.data ?? [];
  const vibeOptions = useMemo(() => mapVibesToListItems(apiVibes), [apiVibes]);
  const resolvedVibeIds = useMemo(
    () => resolveVibeIds(selectedIds, apiVibes),
    [apiVibes, selectedIds],
  );

  useEffect(() => {
    if (didPrefill) return;
    if (vibesListQuery.isLoading || userVibesQuery.isLoading) return;
    if (apiVibes.length === 0) {
      if (!vibesListQuery.isFetching && !userVibesQuery.isFetching) {
        setDidPrefill(true);
      }
      return;
    }

    const fromApi = userVibesQuery.data ?? [];
    if (fromApi.length > 0) {
      setSelectedIds(fromApi.map((vibe) => toChipId(vibe.id)));
      setDidPrefill(true);
      return;
    }

    if (savedInterests.length > 0) {
      const matched = resolveVibeIds(savedInterests, apiVibes).map(toChipId);
      if (matched.length > 0) {
        setSelectedIds(matched);
      }
      setDidPrefill(true);
      return;
    }

    if (!vibesListQuery.isFetching && !userVibesQuery.isFetching) {
      setDidPrefill(true);
    }
  }, [
    apiVibes,
    didPrefill,
    savedInterests,
    userVibesQuery.data,
    userVibesQuery.isFetching,
    userVibesQuery.isLoading,
    vibesListQuery.isFetching,
    vibesListQuery.isLoading,
  ]);

  // Keep selection aligned to API vibe ids (drops stale local/fallback ids).
  useEffect(() => {
    if (apiVibes.length === 0 || selectedIds.length === 0) return;
    const validIds = new Set(apiVibes.map((vibe) => toChipId(vibe.id)));
    const hasInvalid = selectedIds.some((id) => !validIds.has(id));
    if (!hasInvalid) return;

    const remapped = resolveVibeIds(selectedIds, apiVibes).map(toChipId);
    setSelectedIds(remapped);
  }, [apiVibes, selectedIds]);

  async function handleContinue() {
    if (resolvedVibeIds.length < MOVE_IN_INTERESTS_MIN) {
      Alert.alert(
        'Select interests',
        `Pick at least ${MOVE_IN_INTERESTS_MIN} interests to continue.`,
      );
      return;
    }

    try {
      await saveVibes.mutateAsync(resolvedVibeIds);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to save vibes. Please try again.';
      Alert.alert('Could not save', message);
      return;
    }

    setMoveInInterests(resolvedVibeIds.map(String));

    if (fromMenu) {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/menu');
      }
      return;
    }

    router.push('/move-in-background');
  }

  const isLoadingOptions =
    vibesListQuery.isLoading || (userVibesQuery.isLoading && !didPrefill);
  const canContinue =
    apiVibes.length > 0 && resolvedVibeIds.length >= MOVE_IN_INTERESTS_MIN;

  return (
    <ProfileStackScreen
      title={fromMenu ? 'Your Vibes' : 'A Little About You'}
      centerTitle
      style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled">
        <Typography variant="display" size="xs" weight="bold" style={styles.title}>
          Tell Us What You Enjoy
        </Typography>
        <Typography variant="text" size="sm" color={palette.gray[600]} style={styles.subtitle}>
          Select at least {MOVE_IN_INTERESTS_MIN} interests to personalize your HelloWorld
          experience.
        </Typography>

        {isLoadingOptions ? (
          <VibeGridSkeleton />
        ) : (
          <VibeSelectionList
            vibes={vibeOptions}
            selectedIds={selectedIds}
            onChange={setSelectedIds}
            variant="onLight"
            scrollable={false}
            maxSelection={MOVE_IN_INTERESTS_MAX}
            onMaxReached={() =>
              Alert.alert(
                'Limit reached',
                `You can select up to ${MOVE_IN_INTERESTS_MAX} interests.`,
              )
            }
            style={styles.vibeList}
          />
        )}
      </ScrollView>

      <View style={styles.footerWrap}>
        <LinearGradient
          colors={['rgba(255,255,255,0)', palette.white]}
          style={styles.footerFade}
          pointerEvents="none"
        />
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <Button
            label={fromMenu ? 'Save' : 'Continue'}
            onPress={() => {
              void handleContinue();
            }}
            disabled={!canContinue || saveVibes.isPending || isLoadingOptions}
            loading={saveVibes.isPending}
          />
        </View>
      </View>
    </ProfileStackScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: palette.white,
  },
  scroll: {
    paddingTop: 8,
    paddingBottom: 120,
    gap: 16,
  },
  title: {
    color: palette.gray[900],
  },
  subtitle: {
    lineHeight: 22,
  },
  vibeList: {
    marginTop: 4,
  },
  footerWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  footerFade: {
    height: 28,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    backgroundColor: palette.white,
  },
});
