import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { HDP_SECTION_NAV, type HdpSectionId } from '@/constants/hdp';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';

type HdpSectionNavProps = {
  activeId: HdpSectionId;
  onChange: (id: HdpSectionId) => void;
  items?: readonly { id: HdpSectionId; label: string }[];
};

export function HdpSectionNav({
  activeId,
  onChange,
  items = HDP_SECTION_NAV,
}: HdpSectionNavProps) {
  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        {items.map((item) => {
          const isActive = item.id === activeId;

          return (
            <Pressable
              key={item.id}
              onPress={() => onChange(item.id)}
              style={[styles.pill, isActive && styles.pillActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}>
              <Typography
                variant="text"
                size="sm"
                weight={isActive ? 'bold' : 'medium'}
                color={isActive ? palette.gray[900] : palette.gray[800]}>
                {item.label}
              </Typography>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    alignSelf: 'stretch',
    backgroundColor: palette.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.gray[200],
  },
  content: {
    gap: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
  },
  pillActive: {
    backgroundColor: palette.lime[300],
  },
});
