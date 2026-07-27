import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProfileStackScreen } from '@/components/profile/profile-stack-screen';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { VibeSelectionList } from '@/components/vibe/vibe-selection-list';
import palette from '@/constants/palette';
import {
  emojiForVibeCode,
  MOVE_IN_INTEREST_OPTIONS,
  MOVE_IN_INTERESTS_MAX,
} from '@/constants/vibes';
import { useSaveUserVibes, useUserVibes, useVibesList } from '@/queries/use-vibes';
import { useTenantStore } from '@/stores/tenant-store';
import { resetRootRoute } from '@/utils/navigation-reset';

function toChipId(id: number) {
  return String(id);
}

export function MoveInAboutYouScreen() {
  const insets = useSafeAreaInsets();
  const savedInterests = useTenantStore((state) => state.moveInInterests);
  const setMoveInInterests = useTenantStore((state) => state.setMoveInInterests);

  const vibesListQuery = useVibesList();
  const userVibesQuery = useUserVibes();
  const saveVibes = useSaveUserVibes();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [didPrefill, setDidPrefill] = useState(false);

  const apiVibes = vibesListQuery.data ?? [];

  const vibeOptions = useMemo(() => {
    if (apiVibes.length > 0) {
      return apiVibes.map((vibe) => ({
        id: toChipId(vibe.id),
        label: vibe.display_name,
        emoji: emojiForVibeCode(vibe.code),
      }));
    }

    return MOVE_IN_INTEREST_OPTIONS.map((option) => ({
      id: option.id,
      label: option.label,
      emoji: option.emoji,
    }));
  }, [apiVibes]);

  useEffect(() => {
    if (didPrefill) return;
    if (vibesListQuery.isLoading || userVibesQuery.isLoading) return;

    const fromApi = userVibesQuery.data ?? [];
    if (fromApi.length > 0) {
      setSelectedIds(fromApi.map((vibe) => toChipId(vibe.id)));
      setDidPrefill(true);
      return;
    }

    if (savedInterests.length > 0 && apiVibes.length > 0) {
      const matched = savedInterests
        .map((saved) => {
          if (/^\d+$/.test(saved)) return saved;
          const byCode = apiVibes.find(
            (vibe) => vibe.code.toLowerCase() === saved.toLowerCase(),
          );
          return byCode ? toChipId(byCode.id) : null;
        })
        .filter((id): id is string => Boolean(id));

      if (matched.length > 0) {
        setSelectedIds(matched);
      }
      setDidPrefill(true);
      return;
    }

    if (savedInterests.length > 0 && apiVibes.length === 0) {
      setSelectedIds(savedInterests);
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

  async function handleContinue() {
    if (selectedIds.length === 0) {
      Alert.alert('Select interests', 'Pick at least one interest to continue.');
      return;
    }

    const vibeIds = selectedIds
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id) && id > 0);

    if (apiVibes.length > 0) {
      if (vibeIds.length === 0) {
        Alert.alert('Select interests', 'Pick at least one interest to continue.');
        return;
      }

      try {
        await saveVibes.mutateAsync(vibeIds.slice(0, MOVE_IN_INTERESTS_MAX));
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to save vibes. Please try again.';
        Alert.alert('Could not save', message);
        return;
      }

      setMoveInInterests(vibeIds.map(String));
    } else {
      setMoveInInterests(selectedIds);
    }

    resetRootRoute('/move-in-steps');
  }

  const isLoadingOptions =
    vibesListQuery.isLoading || (userVibesQuery.isLoading && !didPrefill);

  return (
    <ProfileStackScreen title="A Little About You" centerTitle style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled">
        <Typography variant="display" size="xs" weight="bold" style={styles.title}>
          Tell Us What You Enjoy
        </Typography>
        <Typography variant="text" size="sm" color={palette.gray[600]} style={styles.subtitle}>
          Pick up to {MOVE_IN_INTERESTS_MAX} interests to personalize your HelloWorld experience.
        </Typography>

        {isLoadingOptions ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={palette.lime[500]} />
          </View>
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
            label="Continue"
            onPress={() => {
              void handleContinue();
            }}
            disabled={selectedIds.length === 0 || saveVibes.isPending || isLoadingOptions}
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
  loading: {
    paddingVertical: 48,
    alignItems: 'center',
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
