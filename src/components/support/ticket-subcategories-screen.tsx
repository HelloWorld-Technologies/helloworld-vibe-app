import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { HwSymbol } from '@/components/ui/hw-symbol';
import { ProfileStackScreen } from '@/components/profile/profile-stack-screen';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import type { TicketCategoryChild } from '@/types/ticket';

export function TicketSubcategoriesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string; child?: string }>();
  const category = params.category ?? 'Support';
  const children: TicketCategoryChild[] = params.child ? JSON.parse(params.child) : [];

  function openCreateTicket(subCategory: string, subCategoryId: string) {
    router.push({
      pathname: '/create-new-ticket',
      params: {
        category,
        subCategory,
        subCategoryId,
      },
    });
  }

  return (
    <ProfileStackScreen title={category} centerTitle style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {children.map((item, index) => {
            if (item.isVisibleInHC === false) {
              return null;
            }

            return (
              <Pressable
                key={`${item.id}-${index}`}
                style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                onPress={() => openCreateTicket(item.name, item.id)}
                accessibilityRole="button">
                <Typography variant="text" size="md" weight="medium" style={styles.rowLabel}>
                  {item.name}
                </Typography>
                <HwSymbol name="chevron.right" size={14} tintColor={palette.gray[400]} />
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </ProfileStackScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: palette.white,
  },
  scroll: {
    padding: 20,
    paddingBottom: 32,
  },
  card: {
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: palette.gray[200],
    backgroundColor: palette.white,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.gray[200],
  },
  rowPressed: {
    backgroundColor: palette.gray[50],
  },
  rowLabel: {
    flex: 1,
    color: palette.gray[900],
  },
});
