import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { postUserDetails } from '@/api/user';
import { MoveInSearchableSelect } from '@/components/move-in/move-in-searchable-select';
import { ProfileStackScreen } from '@/components/profile/profile-stack-screen';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import {
  MOVE_IN_COLLEGE_OPTIONS,
  MOVE_IN_COMPANY_OPTIONS,
  MOVE_IN_OTHER_COLLEGE_LABEL,
  MOVE_IN_OTHER_COMPANY_LABEL,
  MOVE_IN_SELF_EMPLOYED_LABEL,
} from '@/constants/move-in-background';
import palette from '@/constants/palette';
import { useTenantProfile, useTenantStore } from '@/stores/tenant-store';
import {
  isMoveInBackgroundComplete,
  mergeBackgroundWithTenantProfile,
  restoreCollegeSelection,
  restoreWorkplaceSelection,
} from '@/utils/move-in-background';
import { resetRootRoute } from '@/utils/navigation-reset';

type OpenField = 'college' | 'company' | null;

export function MoveInBackgroundScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ from?: string }>();
  const fromMenu = params.from === 'menu';
  const profile = useTenantProfile();
  const savedBackground = useTenantStore((state) => state.moveInBackground);
  const setMoveInBackground = useTenantStore((state) => state.setMoveInBackground);
  const setProfile = useTenantStore((state) => state.setProfile);
  const fetchProfile = useTenantStore((state) => state.fetchProfile);
  const didHydrateFromProfile = useRef(false);

  const initialBackground = mergeBackgroundWithTenantProfile(savedBackground, profile);
  const restoredCollege = restoreCollegeSelection(initialBackground.college);
  const restoredWorkplace = restoreWorkplaceSelection(initialBackground);

  const [college, setCollege] = useState(restoredCollege.college);
  const [customCollege, setCustomCollege] = useState(restoredCollege.customCollege);
  const [workplace, setWorkplace] = useState(restoredWorkplace.workplace);
  const [customCompany, setCustomCompany] = useState(restoredWorkplace.customCompany);
  const [isSelfEmployed, setIsSelfEmployed] = useState(restoredWorkplace.isSelfEmployed);
  const [openField, setOpenField] = useState<OpenField>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (didHydrateFromProfile.current || !profile) return;

    const merged = mergeBackgroundWithTenantProfile(savedBackground, profile);
    if (!merged.college && !merged.workplace) {
      didHydrateFromProfile.current = true;
      return;
    }

    const nextCollege = restoreCollegeSelection(merged.college);
    const nextWorkplace = restoreWorkplaceSelection(merged);

    setCollege((current) => current || nextCollege.college);
    setCustomCollege((current) => current || nextCollege.customCollege);
    setWorkplace((current) => current || nextWorkplace.workplace);
    setCustomCompany((current) => current || nextWorkplace.customCompany);
    setIsSelfEmployed((current) => current || nextWorkplace.isSelfEmployed);
    setMoveInBackground(merged);
    didHydrateFromProfile.current = true;
  }, [profile, savedBackground, setMoveInBackground]);

  const resolvedCollege =
    college === MOVE_IN_OTHER_COLLEGE_LABEL ? customCollege.trim() : college.trim();
  const resolvedWorkplace = isSelfEmployed
    ? MOVE_IN_SELF_EMPLOYED_LABEL
    : workplace === MOVE_IN_OTHER_COMPANY_LABEL
      ? customCompany.trim()
      : workplace.trim();

  const draftBackground = {
    college: resolvedCollege,
    workplace: resolvedWorkplace,
    isSelfEmployed,
    workEmail: savedBackground.workEmail,
    workEmailVerified: savedBackground.workEmailVerified,
  };

  async function handleSave() {
    if (!resolvedCollege) {
      Alert.alert('College required', 'Please select where you studied.');
      return;
    }

    if (!resolvedWorkplace) {
      Alert.alert('Workplace required', 'Please select where you currently work.');
      return;
    }

    if (college === MOVE_IN_OTHER_COLLEGE_LABEL && !customCollege.trim()) {
      Alert.alert('College name required', 'Please type your college name.');
      return;
    }

    if (
      !isSelfEmployed &&
      workplace === MOVE_IN_OTHER_COMPANY_LABEL &&
      !customCompany.trim()
    ) {
      Alert.alert('Company name required', 'Please type your company name.');
      return;
    }

    setSaving(true);
    const response = await postUserDetails({
      college: resolvedCollege,
      company: resolvedWorkplace,
    });
    setSaving(false);

    if (!response.success) {
      Alert.alert(
        'Unable to save',
        response.message ?? 'Failed to save your details. Please try again.',
      );
      return;
    }

    setMoveInBackground(draftBackground);

    if (profile) {
      setProfile({
        ...profile,
        college: resolvedCollege,
        company: resolvedWorkplace,
        userInfo: {
          ...profile.userInfo,
          college: resolvedCollege,
          company: resolvedWorkplace,
        },
      });
    }

    if (fromMenu) {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/menu');
      }
      return;
    }

    resetRootRoute('/move-in-steps');
  }

  function handleCompanySelect(value: string) {
    setWorkplace(value);
    setIsSelfEmployed(false);

    if (value !== MOVE_IN_OTHER_COMPANY_LABEL) {
      setCustomCompany('');
    }
  }

  function handleSelfEmployed() {
    setWorkplace(MOVE_IN_SELF_EMPLOYED_LABEL);
    setIsSelfEmployed(true);
    setCustomCompany('');
  }

  return (
    <ProfileStackScreen
      title={fromMenu ? 'Education & Professional Details' : 'A Little About You'}
      centerTitle
      style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
        keyboardShouldPersistTaps="handled">
        <Typography variant="text" size="sm" color={palette.gray[600]} style={styles.intro}>
          Share your college or workplace to help build a more connected community.
        </Typography>

        <MoveInSearchableSelect
          label="Where did you study?"
          placeholder="Search or select your College"
          value={college}
          options={MOVE_IN_COLLEGE_OPTIONS}
          otherLabel={MOVE_IN_OTHER_COLLEGE_LABEL}
          customValue={customCollege}
          isOpen={openField === 'college'}
          onOpenChange={(open) => setOpenField(open ? 'college' : null)}
          onSelect={setCollege}
          onCustomChange={setCustomCollege}
          containerStyle={[styles.field, openField === 'college' && styles.fieldRaised]}
        />

        <MoveInSearchableSelect
          label="Where do you currently work?"
          placeholder="Search or select your Company"
          value={isSelfEmployed ? MOVE_IN_SELF_EMPLOYED_LABEL : workplace}
          options={MOVE_IN_COMPANY_OPTIONS}
          otherLabel={MOVE_IN_OTHER_COMPANY_LABEL}
          selfEmployedLabel={MOVE_IN_SELF_EMPLOYED_LABEL}
          customValue={customCompany}
          isOpen={openField === 'company'}
          onOpenChange={(open) => setOpenField(open ? 'company' : null)}
          onSelect={handleCompanySelect}
          onCustomChange={setCustomCompany}
          onSelfEmployed={handleSelfEmployed}
          containerStyle={[styles.field, openField === 'company' && styles.fieldRaised]}
        />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Button
          label={fromMenu ? 'Save' : 'Save & Continue'}
          onPress={() => void handleSave()}
          loading={saving}
          disabled={!isMoveInBackgroundComplete(draftBackground)}
        />
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
    gap: 20,
  },
  intro: {
    lineHeight: 22,
  },
  field: {
    zIndex: 1,
  },
  fieldRaised: {
    zIndex: 3,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: palette.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.gray[200],
  },
});
