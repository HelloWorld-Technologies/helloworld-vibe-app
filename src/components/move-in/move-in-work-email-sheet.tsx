import { HwSymbol } from '@/components/ui/hw-symbol';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import { getCompanyEmailDomain, isWorkEmailValidForCompany } from '@/utils/move-in-background';

type MoveInWorkEmailSheetProps = {
  visible: boolean;
  company: string;
  email: string;
  onClose: () => void;
  onVerified: (email: string) => void;
};

export function MoveInWorkEmailSheet({
  visible,
  company,
  email,
  onClose,
  onVerified,
}: MoveInWorkEmailSheetProps) {
  const insets = useSafeAreaInsets();
  const [draftEmail, setDraftEmail] = useState(email);
  const [submitting, setSubmitting] = useState(false);
  const domain = getCompanyEmailDomain(company);

  useEffect(() => {
    if (!visible) return;
    setDraftEmail(email);
    setSubmitting(false);
  }, [email, visible]);

  async function handleSendVerification() {
    const trimmed = draftEmail.trim();
    if (!trimmed) {
      Alert.alert('Enter email', 'Please enter your work email to continue.');
      return;
    }

    if (!isWorkEmailValidForCompany(trimmed, company)) {
      Alert.alert('Invalid email', `${company} email only. Use your @${domain} address.`);
      return;
    }

    setSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      onVerified(trimmed);
      onClose();
      Alert.alert('Verification email sent', 'Check your inbox to verify your work email.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={[styles.content, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <TextField
          label="Enter your Work Email"
          value={draftEmail}
          onChangeText={setDraftEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          placeholder={`name@${domain}`}
        />

        <Typography variant="text" size="xs" color={palette.red[600]} style={styles.domainHint}>
          {company} Email Only
        </Typography>

        <Button
          label="Send Verification Email"
          onPress={() => void handleSendVerification()}
          loading={submitting}
          style={styles.cta}
        />

        <View style={styles.creditBanner}>
          <Typography variant="text" size="sm" color="#7A271A" style={styles.creditCopy}>
            Verify your work email to continue and unlock your ₹500 app credit.
          </Typography>
        </View>
      </View>
    </BottomSheet>
  );
}

type MoveInWorkEmailVerifiedBannerProps = {
  email: string;
};

export function MoveInWorkEmailVerifiedBanner({ email }: MoveInWorkEmailVerifiedBannerProps) {
  return (
    <View style={styles.verifiedRow}>
      <View style={styles.verifiedIcon}>
        <HwSymbol name="checkmark" size={10} weight="bold" tintColor={palette.white} />
      </View>
      <Typography variant="text" size="sm" color={palette.blue[600]}>
        Your Email {email} is verified
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 12,
  },
  domainHint: {
    marginTop: -4,
  },
  cta: {
    marginTop: 8,
  },
  creditBanner: {
    marginTop: 8,
    backgroundColor: '#FFF0D1',
    borderRadius: Radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  creditCopy: {
    lineHeight: 20,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: -4,
  },
  verifiedIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: palette.blue[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
});
