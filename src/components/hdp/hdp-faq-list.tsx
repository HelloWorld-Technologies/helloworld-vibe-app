import { HwSymbol } from '@/components/ui/hw-symbol';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import {
  AnimatedAccordionContent,
  useAnimatedChevronRotation,
} from '@/components/ui/animated-accordion';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';

type HdpFaqListProps = {
  items: readonly { question: string; answer: string }[];
};

function FaqAccordionItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const chevronStyle = useAnimatedChevronRotation(isOpen);

  return (
    <View style={styles.item}>
      <Pressable
        onPress={onToggle}
        style={styles.questionRow}
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}>
        <Typography variant="text" size="sm" weight="medium" style={styles.question}>
          {question}
        </Typography>
        <Animated.View style={chevronStyle}>
          <HwSymbol name="chevron.down" size={14} tintColor={palette.gray[600]} />
        </Animated.View>
      </Pressable>

      {answer ? (
        <AnimatedAccordionContent expanded={isOpen}>
          <Typography variant="text" size="sm" color={palette.textSecondary} style={styles.answer}>
            {answer}
          </Typography>
        </AnimatedAccordionContent>
      ) : null}
    </View>
  );
}

export function HdpFaqList({ items }: HdpFaqListProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(2);

  return (
    <View style={styles.list}>
      {items.map((item, index) => (
        <FaqAccordionItem
          key={item.question}
          question={item.question}
          answer={item.answer}
          isOpen={openIndex === index}
          onToggle={() => setOpenIndex(openIndex === index ? null : index)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 8,
  },
  item: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.gray[200],
    paddingBottom: 12,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 8,
  },
  question: {
    flex: 1,
  },
  answer: {
    paddingBottom: 8,
  },
});
