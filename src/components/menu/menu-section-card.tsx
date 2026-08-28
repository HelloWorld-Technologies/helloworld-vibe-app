import { StyleSheet, View } from 'react-native';

import { MenuRow } from '@/components/menu/menu-row';
import { Typography } from '@/components/ui/typography';
import type { MenuSection } from '@/constants/menu';
import palette from '@/constants/palette';

type MenuSectionCardProps = {
  section: MenuSection;
  onItemPress: (itemId: string) => void;
};

export function MenuSectionCard({ section, onItemPress }: MenuSectionCardProps) {
  return (
    <View style={styles.section}>
      <Typography variant="text" size="lg" weight="medium" style={styles.title}>
        {section.title}
      </Typography>
      <View style={styles.cardShadow}>
        <View style={styles.card}>
          {section.items.map((item, index) => (
            <MenuRow
              key={item.id}
              item={item}
              onPress={() => onItemPress(item.id)}
              isLast={index === section.items.length - 1}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
  title: {
    color: palette.black,
    paddingHorizontal: 4,
  },
  cardShadow: {
    borderRadius: 16,
    backgroundColor: palette.white,
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  card: {
    backgroundColor: palette.white,
    borderRadius: 16,
    overflow: 'hidden',
  },
});
