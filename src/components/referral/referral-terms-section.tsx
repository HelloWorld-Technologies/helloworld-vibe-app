import { StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';

type ReferralTermsSectionProps = {
  terms: string[];
};

export function ReferralTermsSection({ terms }: ReferralTermsSectionProps) {
  if (terms.length === 0) return null;

  return (
    <View style={styles.section}>
      <Typography variant="text" size="lg" weight="bold">
        Here&apos;s what you need to keep in mind
      </Typography>

      <View style={styles.card}>
        {terms.map((term, index) => (
          <View key={`term-${index}`} style={styles.row}>
            <Typography variant="text" size="sm" color={palette.gray[500]}>
              {'\u2022'}
            </Typography>
            <Typography variant="text" size="sm" color={palette.gray[800]} style={styles.copy}>
              {term}
            </Typography>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
  card: {
    backgroundColor: palette.white,
    borderRadius: Radius.md,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: palette.gray[100],
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  copy: {
    flex: 1,
  },
});
