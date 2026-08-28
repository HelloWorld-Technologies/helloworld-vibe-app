import { useState } from 'react';
import { Pressable, View } from 'react-native';

import {
  AccordionChevron,
  accordionStyles,
  AnimatedAccordionContent,
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
  return (
    <View style={accordionStyles.item}>
      <Pressable
        onPress={onToggle}
        style={accordionStyles.headerRow}
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}>
        <Typography variant="text" size="sm" weight="medium" style={accordionStyles.headerTitle}>
          {question}
        </Typography>
        <AccordionChevron expanded={isOpen} />
      </Pressable>

      {answer ? (
        <AnimatedAccordionContent expanded={isOpen}>
          <Typography
            variant="text"
            size="sm"
            color={palette.gray[600]}
            style={accordionStyles.bodyContent}>
            {answer}
          </Typography>
        </AnimatedAccordionContent>
      ) : null}
    </View>
  );
}

export function HdpFaqList({ items }: HdpFaqListProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (items.length === 0) return null;

  return (
    <View style={accordionStyles.list}>
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
